export function parsePolishHtmlToCosmeticsDescriptions(html) {
  const dom = new DOMParser().parseFromString(html, "text/html");
  const q = (sel, root = dom) => root.querySelector(sel);
  const qa = (sel, root = dom) => Array.from(root.querySelectorAll(sel));
  const getText = (el) => (el ? el.textContent.trim() : "");
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim();

  const stripTags = (s) => (s || "").replace(/<[^>]*>/g, "");
  const stripStrongB = (s) => (s || "").replace(/<\/?(strong|b)>/gi, "");
  const decodeEntities = (s) =>
    (s || "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ");

  const htmlFromNodes = (nodes) =>
    nodes && nodes.length ? nodes.map((n) => n.outerHTML || "").join("") : "";

  // --- helpers table parsing ---
  const splitByBr = (html) => {
    if (!html) return [];
    const unified = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p>/gi, "\n");
    return unified
      .split("\n")
      .map((x) => norm(stripTags(x)))
      .filter((x) => x.length);
  };

  const splitByBrPreserveAngle = (html) => {
    if (!html) return [];
    let unified = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p>/gi, "\n");

    unified = decodeEntities(unified);

    const PLACEHOLDER = "___ANGLE_BRACKETS___";
    unified = unified.replace(/<>/g, PLACEHOLDER);
    unified = unified.replace(/<[^>]*>/g, "");
    unified = unified.replace(new RegExp(PLACEHOLDER, "g"), "<>");

    return unified
      .split("\n")
      .map((x) => norm(x))
      .filter((x) => x.length);
  };

  const normalizeRws = (s) => {
    const t = norm(s);
    if (!t) return "";
    if (t === "<>" || /<\s*>/.test(t) || t === "&lt;&gt;" || t === "&lt; &gt;")
      return "<>";
    return t;
  };

  // --- USUWA sekcję "Wartości odżywcze" / "Tabela wartości odżywczych" (h2/h3 + do kolejnego h2/h3) ---
  const removeNutritionSection = (htmlStr) => {
    const d = new DOMParser().parseFromString(`<div>${htmlStr}</div>`, "text/html");
    const root = d.body.firstElementChild;
    if (!root) return htmlStr;

    const headings = Array.from(root.querySelectorAll("h2, h3"));

    const isNutritionHeading = (text) => {
      const t = norm((text || "").toLowerCase()).replace(/:\s*$/, "");
      return (
        t === "wartości odżywcze" ||
        t === "tabela wartości odżywczych" ||
        /^wartości\s+odżywcze$/.test(t) ||
        /^tabela\s+wartości\s+odżywczych$/.test(t)
      );
    };

    const nutritionHeading = headings.find((h) => isNutritionHeading(h.textContent));
    if (!nutritionHeading) return root.innerHTML;

    let cur = nutritionHeading;
    while (cur) {
      const next = cur.nextElementSibling;
      cur.remove();
      if (!next || next.tagName === "H2" || next.tagName === "H3") break;
      cur = next;
    }

    return root.innerHTML;
  };

  // ✅ rozbij dokładnie jeden <p> w danym HTML na dwa <p> (po najbliższym końcu zdania)
  const splitSinglePIntoTwo = (htmlStr) => {
    if (!htmlStr) return htmlStr;

    const tmp = new DOMParser().parseFromString(`<div>${htmlStr}</div>`, "text/html");
    const root = tmp.body.firstElementChild;
    if (!root) return htmlStr;

    const ps = Array.from(root.querySelectorAll("p"));
    if (ps.length !== 1) return root.innerHTML;

    const p = ps[0];
    const text = norm(p.textContent || "");
    if (!text) return root.innerHTML;

    const ends = [...text.matchAll(/[.!?]/g)].map((m) => m.index);
    if (ends.length <= 1) return root.innerHTML;

    const half = Math.floor(text.length / 2);
    let best = ends[0];
    for (const idx of ends) {
      if (Math.abs(idx - half) < Math.abs(best - half)) best = idx;
    }
    const cut = best + 1;

    const a = norm(text.slice(0, cut));
    const b = norm(text.slice(cut));
    if (!a || !b) return root.innerHTML;

    p.outerHTML = `<p>${a}</p><p>${b}</p>`;
    return root.innerHTML;
  };

  // --- Podział na pół z zachowaniem nagłówków/list itp. (liczymy paragrafy) ---
  const splitHtmlPreserveNonPByParagraphCount = (htmlStr) => {
    const tmp = new DOMParser().parseFromString(`<div>${htmlStr}</div>`, "text/html");
    const root = tmp.body.firstElementChild;
    if (!root) return [htmlStr, ""];

    const children = Array.from(root.children);
    const pCount = children.filter((c) => c.tagName === "P").length;

    if (pCount <= 1) {
      const text = norm(root.textContent || "");
      if (!text) return [root.innerHTML, ""];
      const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
      if (sentences.length >= 2) {
        const target = Math.floor(text.length / 2);
        let acc = 0;
        let cutIdx = 1;
        for (let i = 0; i < sentences.length; i++) {
          acc += sentences[i].length + 1;
          if (acc >= target) {
            cutIdx = i + 1;
            break;
          }
        }
        const a = sentences.slice(0, cutIdx).join(" ");
        const b = sentences.slice(cutIdx).join(" ");
        return [`<p>${a}</p>`, b ? `<p>${b}</p>` : ""];
      }
      const half = Math.floor(root.innerHTML.length / 2);
      return [root.innerHTML.slice(0, half), root.innerHTML.slice(half)];
    }

    const splitPoint = Math.ceil(pCount / 2);
    let pSeen = 0;
    const left = [];
    const right = [];
    let beforeFirstP = true;

    for (const child of children) {
      const isP = child.tagName === "P";
      if (isP) {
        beforeFirstP = false;
        pSeen += 1;
        if (pSeen <= splitPoint) left.push(child.outerHTML);
        else right.push(child.outerHTML);
      } else {
        if (beforeFirstP) left.push(child.outerHTML);
        else {
          if (pSeen <= splitPoint) left.push(child.outerHTML);
          else right.push(child.outerHTML);
        }
      }
    }

    return [left.join(""), right.join("")];
  };

  // --- Intro bez nagłówka + sekcje nagłówkowe w obrębie kolumn ---
  const extractIntroAndHeadingSections = (container) => {
    const introNodes = [];
    const sections = [];
    if (!container) return { introNodes, sections };

    const kids = Array.from(container.children || []);
    let i = 0;

    while (i < kids.length && kids[i].tagName !== "H2" && kids[i].tagName !== "H3") {
      introNodes.push(kids[i]);
      i++;
    }

    while (i < kids.length) {
      const el = kids[i];
      if (el.tagName === "H2" || el.tagName === "H3") {
        const headingEl = el;
        const nodes = [];
        i++;
        while (i < kids.length && kids[i].tagName !== "H2" && kids[i].tagName !== "H3") {
          nodes.push(kids[i]);
          i++;
        }
        sections.push({ headingEl, nodes });
      } else {
        introNodes.push(el);
        i++;
      }
    }

    return { introNodes, sections };
  };

  // --- kontenery ---
  const leftCol = q(".left-column") || q(".col-md-6 .left-column") || q(".col-md-6");
  const rightCol = q(".right-column") || q(".col-md-6 .right-column");

  const { introNodes: leftIntro, sections: leftSections } =
    extractIntroAndHeadingSections(leftCol);
  const { introNodes: rightIntro, sections: rightSections } =
    extractIntroAndHeadingSections(rightCol);

  const introHtml = `${htmlFromNodes(leftIntro)}${htmlFromNodes(rightIntro)}`;
  const orderedSections = [...leftSections, ...rightSections];

  const firstSection = orderedSections[0] || null;
  const secondSection = orderedSections[1] || null;
  const restAfterFirst = orderedSections.slice(1); // od drugiej sekcji włącznie
  const restAfterSecond = orderedSections.slice(2); // od trzeciej sekcji włącznie

  // ✅ KLUCZOWA ZMIANA:
  // Jeśli jest intro (cokolwiek przed pierwszym nagłówkiem), to:
  // - desc1/2 = intro
  // - desc3 = firstSection (pierwszy nagłówek)
  // - desc4 = reszta po firstSection
  //
  // Jeśli intro nie ma:
  // - desc1/2 = firstSection
  // - desc3 = secondSection
  // - desc4 = reszta po secondSection
  const hasIntro = norm(stripTags(introHtml)) !== "";

  let desc1Part = "";
  let desc2Part = "";
  let cosmeticsDescription3 = "";
  let cosmeticsDescription4Raw = "";

  if (hasIntro) {
    // 1/2 = intro
    if (introHtml) {
      const [a, b] = splitHtmlPreserveNonPByParagraphCount(introHtml);
      desc1Part = splitSinglePIntoTwo(a);
      desc2Part = splitSinglePIntoTwo(b || "");
    }

    // 3 = pierwszy nagłówek + jego zawartość
    cosmeticsDescription3 = firstSection
      ? `${firstSection.headingEl.outerHTML}${htmlFromNodes(firstSection.nodes)}`
      : "";

    // 4 = reszta po pierwszej sekcji
    cosmeticsDescription4Raw = restAfterFirst.length
      ? restAfterFirst
          .map((s) => `${s.headingEl.outerHTML}${htmlFromNodes(s.nodes)}`)
          .join("")
      : "";
  } else {
    // 1/2 = pierwszy nagłówek + jego zawartość
    if (firstSection) {
      const firstHtml = `${firstSection.headingEl.outerHTML}${htmlFromNodes(firstSection.nodes)}`;
      const [a, b] = splitHtmlPreserveNonPByParagraphCount(firstHtml);
      desc1Part = splitSinglePIntoTwo(a);
      desc2Part = splitSinglePIntoTwo(b || "");
    }

    // 3 = drugi nagłówek + zawartość
    cosmeticsDescription3 = secondSection
      ? `${secondSection.headingEl.outerHTML}${htmlFromNodes(secondSection.nodes)}`
      : "";

    // 4 = reszta po drugiej sekcji
    cosmeticsDescription4Raw = restAfterSecond.length
      ? restAfterSecond
          .map((s) => `${s.headingEl.outerHTML}${htmlFromNodes(s.nodes)}`)
          .join("")
      : "";
  }

  const cosmeticsDescription4 = removeNutritionSection(cosmeticsDescription4Raw);

  // --- tabela: szukamy w całym html ---
  let ingredientsTable = [];
  const tmpDom = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const table = tmpDom.querySelector("table");

  if (table) {
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    ingredientsTable = rows.map((tr, idx) => {
      const tds = Array.from(tr.querySelectorAll("td"));

      const nameHtml = tds[0]?.innerHTML || "";
      const valueHtml = tds[1]?.innerHTML || "";
      const rwsHtml = tds[2]?.innerHTML || "";

      const nameLines = splitByBr(nameHtml).map((s) => norm(stripStrongB(s)));
      const valueLines = splitByBr(valueHtml);
      const rwsLines = splitByBrPreserveAngle(rwsHtml);

      const main = {
        ingredientIndex: idx + 1,
        ingredient: { pl: decodeEntities(nameLines[0] || "") },
        ingredientValue: { pl: decodeEntities(valueLines[0] || "") },
        rws: normalizeRws(decodeEntities(rwsLines[0] || "")),
        additionalLines: [],
      };

      const maxLen = Math.max(nameLines.length, valueLines.length, rwsLines.length);
      for (let i = 1; i < maxLen; i++) {
        const subName = decodeEntities(nameLines[i] || "");
        const subVal = decodeEntities(valueLines[i] || "");
        const subRws = normalizeRws(decodeEntities(rwsLines[i] || ""));
        if (!subName && !subVal && !subRws) continue;

        main.additionalLines.push({
          lineIndex: i,
          ingredient: { pl: subName },
          ingredientValue: { pl: subVal },
          rws: subRws,
        });
      }

      return main;
    });
  }

  const partial = {};
  if (desc1Part) partial.cosmeticsDescription1 = { pl: desc1Part };
  if (desc2Part) partial.cosmeticsDescription2 = { pl: desc2Part };
  if (cosmeticsDescription3) partial.cosmeticsDescription3 = { pl: cosmeticsDescription3 };
  if (cosmeticsDescription4) partial.cosmeticsDescription4 = { pl: cosmeticsDescription4 };
  if (ingredientsTable.length) partial.ingredientsTable = ingredientsTable;

  return partial;
}
