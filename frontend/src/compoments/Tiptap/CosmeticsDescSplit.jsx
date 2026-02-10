import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";
import Button from "../Button/Button";
import { toast } from "react-toastify";
import style from "./TextEditor.module.scss";

export const CosmeticsDescSplit = ({ onReset }) => {
  const dispatch = useDispatch();
  const [cleanedHtml, setCleanedHtml] = useState("");

  function removePTagsFromLists(html) {
    return (html || "").replace(
      /(<ul[\s\S]*?>|<ol[\s\S]*?>)([\s\S]*?)(<\/ul>|<\/ol>)/g,
      (match, openTag, content, closeTag) => {
        const cleanedContent = content.replace(/<\/?p>/g, "");
        return `${openTag}${cleanedContent}${closeTag}`;
      }
    );
  }

  const emptyLangBlock = { pl: "", en: "", de: "", fr: "", it: "" };
  const resetDescriptionsPayload = {
    cosmeticsDescription1: { ...emptyLangBlock },
    cosmeticsDescription2: { ...emptyLangBlock },
    cosmeticsDescription3: { ...emptyLangBlock },
    cosmeticsDescription4: { ...emptyLangBlock },
  };

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: ``,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleaned = removePTagsFromLists(html);
      setCleanedHtml(cleaned);
    },
  });

  function splitHtmlContent(html) {
    if (!html || typeof html !== "string") {
      toast.error("Brak treści HTML do podziału.");
      return;
    }

    // Lista wariantów nagłówka "Składniki, które pokochasz" / itp.
    const header1Candidates = [
      "<h3><strong>Składniki, które pokochasz:</strong></h3>",
      "<h3><strong>Kluczowe składniki:</strong></h3>",
      "<h3><strong>Kluczowe zalety:</strong></h3>",
      "<h3><strong>Zalety produktu:</strong></h3>",
      "<h3>Składniki, które pokochasz:</h3>",
      "<h3>Kluczowe składniki:</h3>",
      "<h3>Kluczowe zalety:</h3>",
      "<h3>Zalety produktu:</h3>",
    ];

    const header1 = header1Candidates.find((h) => html.includes(h));
    if (!header1) {
      toast.error(
        `Nie znaleziono nagłówka sekcji składników. Szukane: ${header1Candidates.join(
          " | "
        )}`
      );
      return;
    }

    const header2 = "<h3><strong>Przeznaczenie:</strong></h3>";
    if (!html.includes(header2)) {
      toast.error(`Nagłówek "${header2}" nie został znaleziony w treści.`);
      return;
    }

    // --- Podział na: [intro + opisy] oraz resztę po header1 ---
    const idxHeader1 = html.indexOf(header1);
    const beforeIngredients = html.slice(0, idxHeader1);
    const afterIngredients = html.slice(idxHeader1 + header1.length);

    if (!afterIngredients) {
      toast.error(`Nie udało się podzielić treści po nagłówku header1.`);
      return;
    }

    // --- Parsowanie części przed header1 ---
    const parser = new DOMParser();
    const doc = parser.parseFromString(beforeIngredients, "text/html");

    // ✅ Zachowaj pierwszy nagłówek H3 z intro (np. "Koreański rytuał...")
    const introH3 = doc.querySelector("h3")?.outerHTML || "";

    // Pobierz wszystkie akapity <p> z intro
    const paragraphs = Array.from(doc.querySelectorAll("p"));
    const pBlocks = paragraphs.map((p) => p.outerHTML).filter(Boolean);

    if (pBlocks.length === 0) {
      toast.error("Nie znaleziono akapitów <p> w treści przed sekcją składników.");
      return;
    }

    // Podziel akapity na dwie części (opis1/opis2)
    const midpoint = Math.ceil(pBlocks.length / 2);
    const opis1 = pBlocks.slice(0, midpoint).join(" ");
    const opis2 = pBlocks.slice(midpoint).join(" ");

    // --- Wewnątrz afterIngredients podziel po header2 ---
    const idxHeader2 = afterIngredients.indexOf(header2);
    if (idxHeader2 === -1) {
      toast.error(`Nie udało się znaleźć "${header2}" po "${header1}".`);
      return;
    }

    const ingredientsToPurpose = afterIngredients.slice(0, idxHeader2);
    const restAfterPurpose = afterIngredients.slice(idxHeader2 + header2.length);

    const opis3 = `${header1}${ingredientsToPurpose}`;
    const opis4 = `${header2}${restAfterPurpose}`;

    // --- Dzielenie opisów 1 i 2 na zdania i wrap w <p> ---
    function splitAndWrap(htmlPart) {
      // Usuń WSZYSTKIE <p ...> i </p> (żeby nie robić zagnieżdżeń)
      const content = (htmlPart || "")
        .replace(/<p[^>]*>/g, "")
        .replace(/<\/p>/g, "")
        .trim();

      // Bez lookbehindów (bardziej kompatybilne)
      const sentences = (content.match(/[^.!?]+(?:[.!?]+|$)/g) || [])
        .map((s) => s.trim())
        .filter(Boolean);

      if (sentences.length === 0) return "";

      let parts = [];
      if (sentences.length <= 4) {
        const mid = Math.ceil(sentences.length / 2);
        parts = [
          sentences.slice(0, mid).join(" "),
          sentences.slice(mid).join(" "),
        ];
      } else {
        const a = Math.ceil(sentences.length / 3);
        const b = Math.ceil((2 * sentences.length) / 3);
        parts = [
          sentences.slice(0, a).join(" "),
          sentences.slice(a, b).join(" "),
          sentences.slice(b).join(" "),
        ];
      }

      return parts
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${p}</p>`)
        .join("");
    }

    const result1 = splitAndWrap(opis1);
    const result2 = splitAndWrap(opis2);

    // ✅ Doklej introH3 do pierwszego opisu
    const opis1WithIntro = introH3 ? `${introH3}${result1}` : result1;

    dispatch(
      updateProduct({
        cosmeticsDescription1: { ...emptyLangBlock, pl: opis1WithIntro },
        cosmeticsDescription2: { ...emptyLangBlock, pl: result2 },
        cosmeticsDescription3: { ...emptyLangBlock, pl: opis3 },
        cosmeticsDescription4: { ...emptyLangBlock, pl: opis4 },
      })
    );

    toast.success("Kod HTML został podzielony");
  }

  const handleReset = () => {
    if (editor) {
      editor.commands.setContent("");
    }
    setCleanedHtml("");
    dispatch(updateProduct(resetDescriptionsPayload));
    toast.success("Podział został zresetowany");
  };

  useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent("");
      setCleanedHtml("");
      dispatch(updateProduct(resetDescriptionsPayload));
    }
  }, [onReset, editor, dispatch]);

  return (
    <div className={style.textEditorContainer}>
      <h4>Podział</h4>

      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      <div className={style.textEditorContainer__btn}>
        <Button
          onClick={() => {
            if (!cleanedHtml) {
              toast.error("Brak treści do podziału (cleanedHtml jest puste).");
              return;
            }
            splitHtmlContent(cleanedHtml);
          }}
        >
          Podziel
        </Button>

        <Button
          onClick={handleReset}
          className={style.textEditorContainer__btnRed}
        >
          Resetuj podział
        </Button>
      </div>
    </div>
  );
};
