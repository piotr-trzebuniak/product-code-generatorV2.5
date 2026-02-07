// utils/parsers/parsePolishHtmlToProduct.js
export function parsePolishHtmlToProduct(html) {
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

  const splitByBr = (html, { keepEmpty = false } = {}) => {
    if (!html) return [];

    const unified = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p>/gi, "\n");

    const parts = unified.split("\n").map((x) => norm(stripTags(x)));

    return keepEmpty ? parts : parts.filter((x) => x.length);
  };


  // --- NOWA funkcja: splitByBrPreserveAngle ---
  // Używamy jej tylko dla komórki RWS, żeby NIE usuwać literalnego "<>"
  const splitByBrPreserveAngle = (html, { keepEmpty = false } = {}) => {
    if (!html) return [];

    let unified = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p>/gi, "\n");

    unified = decodeEntities(unified);

    const PLACEHOLDER = "___ANGLE_BRACKETS___";
    // ważne: łap też "< >" ze spacją
    unified = unified.replace(/<\s*>/g, PLACEHOLDER);

    unified = unified.replace(/<[^>]*>/g, "");

    unified = unified.replace(new RegExp(PLACEHOLDER, "g"), "<>");

    const parts = unified.split("\n").map((x) => norm(x));
    return keepEmpty ? parts : parts.filter((x) => x.length);
  };

  // --- koniec nowej funkcji ---

  const getHeadingSection = (startsWith) => {
    const h3 = qa("h3").find((h) =>
      norm(getText(h)).toLowerCase().startsWith(startsWith.toLowerCase())
    );
    if (!h3) return null;
    const nodes = [];
    let cur = h3.nextElementSibling;
    while (cur && cur.tagName !== "H3") {
      nodes.push(cur);
      cur = cur.nextElementSibling;
    }
    return { heading: h3, nodes };
  };

  const getSecondHeadingSection = (startsWith) => {
    const h3s = qa("h3");
    let foundHeadings = 0;
    let targetH3 = null;

    // Szukamy drugiego nagłówka h3, który pasuje do startsWith
    for (let h3 of h3s) {
      if (norm(getText(h3)).toLowerCase().startsWith(startsWith.toLowerCase())) {
        foundHeadings++;
        if (foundHeadings === 2) {
          targetH3 = h3;
          break;
        }
      }
    }

    // Jeśli drugi nagłówek h3 został znaleziony, szukamy jego sekcji
    if (!targetH3) return null;

    const nodes = [];
    let cur = targetH3.nextElementSibling;
    while (cur && cur.tagName !== "H3") {
      nodes.push(cur);
      cur = cur.nextElementSibling;
    }

    return { heading: targetH3, nodes };
  };

  const htmlFromNodes = (nodes) =>
    nodes && nodes.length ? nodes.map((n) => n.outerHTML || "").join("") : "";

  // shortDescription.pl = wszystko PRZED pierwszym .row
  const extractShortDescHtml = () => {
    const row = q(".row");
    const nodes = [];
    const bodyChildren = Array.from(dom.body?.children || []);
    for (const el of bodyChildren) {
      if (row && el === row) break;
      if (!["SCRIPT", "STYLE"].includes(el.tagName)) nodes.push(el);
    }
    if (nodes.length) return htmlFromNodes(nodes);
    const p = qa("p");
    return p.length ? p.slice(0, 3).map((x) => x.outerHTML).join("") : "";
  };

  const parseAmountUnit = (raw) => {
    const txt = norm(stripTags(raw));
    const m = txt.match(/(\d+(?:[.,]\d+)?)\s*([a-zA-Ząćęłńóśżźµ%]+)/);
    if (!m) return { amount: null, unit: "" };

    return {
      amount: parseFloat(m[1].replace(",", ".")),
      unit: m[2]
    };
  };


  // 1) shortDescription.pl
  const shortDescriptionHtml = extractShortDescHtml();

  // 2) Sekcja „Skład:”
  let descriptionHtmlPL = "";
  const possibleHeadings = ["O produkcie:", "O produkcie", "Skład:", "Skład"];


  let skladSection = null;

  for (const heading of possibleHeadings) {
    skladSection = getHeadingSection(heading);
    if (skladSection) break;
  }


  // LONG DESCRIPTION – treść pomiędzy nagłówkiem "O produkcie" a danymi technicznymi
  const longDescNodes = [];

  if (skladSection?.nodes?.length) {
    for (const n of skladSection.nodes) {
      const text = n.textContent || "";

      // stop gdy trafimy na dane techniczne lub tabelę
      if (
        /Wielkość opakowania/i.test(text) ||
        /Porcja jednorazowa/i.test(text) ||
        /Ilość porcji/i.test(text) ||
        n.querySelector?.("table")
      ) {
        break;
      }

      longDescNodes.push(n);
    }

    if (longDescNodes.length) {
      descriptionHtmlPL = htmlFromNodes(longDescNodes);
    }
  }


  let sizeAmount = null;
  let sizeUnitPL = "";
  let portionAmount = null;
  let portionUnitPL = "";
  let portionQty = 0;
  let ingredientsTable = [];

  if (skladSection) {
    // Wielkość opakowania
    const pSize = skladSection.nodes.find((n) =>
      /Wielkość opakowania/i.test(n.textContent)
    );

    if (pSize) {
      const rawFull = norm(stripTags(pSize.innerHTML))
        .replace(/Wielkość opakowania:/i, "")
        .trim();

      // regex szuka liczby + jednostki
      const m = rawFull.match(/(\d+(?:[.,]\d+)?)\s*([a-zA-Ząćęłńóśżź%µ]+)/);

      if (m) {
        sizeAmount = parseFloat(m[1].replace(",", "."));
        sizeUnitPL = m[2];
      }
    }
    // Porcja jednorazowa
    const pPortion = skladSection.nodes.find((n) => /Porcja jednorazowa/i.test(n.textContent));
    if (pPortion) {
      const strong = q("strong", pPortion);
      const raw = strong ? getText(strong) : pPortion.textContent.replace(/.*?:/, "");
      const { amount, unit } = parseAmountUnit(raw);
      portionAmount = amount; portionUnitPL = unit;
    }

    // Ilość porcji w opakowaniu
    const pQty = skladSection.nodes.find((n) => /Ilość porcji w opakowaniu/i.test(n.textContent));
    if (pQty) {
      const strong = q("strong", pQty);
      const raw = strong ? getText(strong) : pQty.textContent.replace(/.*?:/, "");
      const parsed = parseFloat(norm(raw).replace(",", "."));
      portionQty = isNaN(parsed) ? 0 : parsed;
    }

    // Tabela składników z obsługą linii dodatkowych (br)
    const tableHost = skladSection.nodes.find((n) => q("table", n));
    const table = q("table", tableHost || dom);
    if (table) {
      const rows = qa("tbody tr", table);
      ingredientsTable = rows
        .map((tr, idx) => {
          const tds = qa("td", tr);
          const nameHtml = tds[0]?.innerHTML || "";
          const valueHtml = tds[1]?.innerHTML || "";
          const rwsHtml = tds[2]?.innerHTML || "";

          // Podział na linie po <br>
          const nameLines = splitByBr(nameHtml).map((s) => norm(stripStrongB(s)));
          const valueLines = splitByBr(valueHtml, { keepEmpty: true });

          // UŻYJEMY specjalnej funkcji dla RWS, żeby nie tracić "<>"
          const rwsLines = splitByBrPreserveAngle(rwsHtml, { keepEmpty: true });

          // Linia główna
          const mainName = decodeEntities(nameLines[0] || "");
          const mainVal = decodeEntities(valueLines[0] || "");
          const rawRws = decodeEntities(rwsLines[0] || "");

          // 👉 pomijamy wiersz, jeśli to nagłówek "Składniki"
          if (idx === 0 && norm(mainName).toLowerCase() === "składniki") {
            return null;
          }

          const normalizeRws = (s) => {
            const t = norm(s);
            if (!t) return "";
            // zamień różne warianty znaczenia "brak RWS" na "<>"
            if (t === "<>" || /<\s*>/.test(t) || /&lt;\s*&gt;/.test(s) || t === "&lt;&gt;" || t === "&lt; &gt;") return "<>";
            return t;
          };

          const main = {
            ingredientIndex: idx + 1,
            ingredient: { pl: mainName },
            ingredientValue: { pl: mainVal },
            rws: normalizeRws(rawRws),
            additionalLines: [],
          };

          // Linie dodatkowe (jeśli są)
          if (nameLines.length > 1 || valueLines.length > 1 || rwsLines.length > 1) {
            const maxLen = Math.max(nameLines.length, valueLines.length, rwsLines.length);
            for (let i = 1; i < maxLen; i++) {
              const subName = decodeEntities(nameLines[i] || "");
              const subVal = decodeEntities(valueLines[i] || "");
              const subRws = normalizeRws(rwsLines[i] || "");
              if (!subName && !subVal && !subRws) continue;
              main.additionalLines.push({
                lineIndex: i,
                ingredient: { pl: subName },
                ingredientValue: { pl: subVal },
                rws: subRws,
              });
            }
          }

          return main;
        })
        .filter(Boolean); // usuwa null (czyli linię "Składniki")
    }

  }

  // 3) „Składniki:”
  const skladnikiHeadings = ["Składniki:", "Składniki"];

  let skladnikiSection = null;

  for (const heading of skladnikiHeadings) {
    skladnikiSection = getHeadingSection(heading);
    if (skladnikiSection) break;
  }
  const ingredientsHtmlPL = skladnikiSection ? htmlFromNodes(skladnikiSection.nodes) : ""


  // 4) Sposób użycia / Przeciwwskazania / Przechowywanie / Informacja
  const howToUseHtmlPL = (getHeadingSection("Sposób użycia")?.nodes)
    ? htmlFromNodes(getHeadingSection("Sposób użycia").nodes)
    : "";

  const contraindicationsHtmlPL = (getHeadingSection("Przeciwwskazania")?.nodes)
    ? htmlFromNodes(getHeadingSection("Przeciwwskazania").nodes)
    : "";

  const storageHtmlPL = (getHeadingSection("Przechowywanie")?.nodes)
    ? htmlFromNodes(getHeadingSection("Przechowywanie").nodes)
    : "";

  const infoHtmlPL = (getHeadingSection("Informacja")?.nodes)
    ? htmlFromNodes(getHeadingSection("Informacja").nodes)
    : "";

  // 5) Nazwa produktu z pierwszego <p><strong>…</strong></p>
  let productNamePL = "";
  const firstStrong = q("p > strong");
  if (firstStrong) productNamePL = norm(getText(firstStrong));

  // ——— wynik: partial tylko PL ———
  const partial = {};

  if (productNamePL) partial.productName = { pl: productNamePL };
  if (shortDescriptionHtml) partial.shortDescription = { pl: shortDescriptionHtml };

  // size / portion / quantity
  if (sizeAmount !== null || sizeUnitPL) {
    partial.size = {};
    if (sizeAmount !== null) partial.size.sizeAmount = sizeAmount;
    if (sizeUnitPL) partial.size.unit = { pl: sizeUnitPL };
  }

  if (portionAmount !== null || portionUnitPL) {
    partial.portion = {};
    if (portionAmount !== null) partial.portion.portionAmount = portionAmount;
    if (portionUnitPL) partial.portion.unit = { pl: portionUnitPL };
  }

  if (portionQty !== null && portionQty !== undefined) partial.portionQuantity = portionQty;


  // tabela składników
  if (ingredientsTable.length) partial.ingredientsTable = ingredientsTable;

  // składniki (lista)
  if (ingredientsHtmlPL) partial.ingredients = { pl: ingredientsHtmlPL };

  // sekcje
  if (howToUseHtmlPL) partial.howToUse = { pl: howToUseHtmlPL };
  if (contraindicationsHtmlPL) partial.contraindications = { pl: contraindicationsHtmlPL };
  if (storageHtmlPL) partial.storage = { pl: storageHtmlPL };
  if (infoHtmlPL) partial.additionalInformation = { pl: infoHtmlPL };
  if (descriptionHtmlPL) {
    partial.description = { pl: descriptionHtmlPL };
  }

  return partial;
}
