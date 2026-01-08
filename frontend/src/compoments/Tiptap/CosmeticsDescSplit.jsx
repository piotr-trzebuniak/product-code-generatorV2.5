import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import style from "./TextEditor.module.scss";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";
import Button from "../Button/Button";
import { toast } from "react-toastify";

export const CosmeticsDescSplit = ({ onReset }) => {
  const dispatch = useDispatch();
  const [cleanedHtml, setCleanedHtml] = useState("");

  function removePTagsFromLists(html) {
    return html.replace(
      /(<ul[\s\S]*?>|<ol[\s\S]*?>)([\s\S]*?)(<\/ul>|<\/ol>)/g,
      (match, openTag, content, closeTag) => {
        const cleanedContent = content.replace(/<\/?p>/g, "");
        return `${openTag}${cleanedContent}${closeTag}`;
      }
    );
  }

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: ``,

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleaned = removePTagsFromLists(html);
      setCleanedHtml(cleaned); // Zaktualizuj stan cleanedHtml
    },
  });

  function splitHtmlContent(html) {
    const headers = [
      "<h3><strong>Składniki, które pokochasz:</strong></h3>",
      "<h3><strong>Kluczowe składniki:</strong></h3>",
      "<h3><strong>Kluczowe zalety:</strong></h3>",
      "<h3><strong>Zalety produktu:</strong></h3>",
      "<h3>Składniki, które pokochasz:</h3>",
      "<h3>Kluczowe składniki:</h3>",
      "<h3>Kluczowe zalety:</h3>",
      "<h3>Zalety produktu:</h3>"
    ];

    const header1 = headers.find(header => html.includes(header));

    if (!header1) {
      console.error(`Żaden z nagłówków nie został znaleziony: ${headers.join(", ")}`);
      return;
    }

    const header2 = "<h3><strong>Przeznaczenie:</strong></h3>";

    const [beforeIngredients, afterIngredients] = html.split(header1);

    if (!afterIngredients) {
      console.error(`Nie można podzielić kodu HTML po nagłówku "${header1}".`);
      return;
    }

    // Tworzenie parsera DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(beforeIngredients, "text/html");

    // Wyciąganie wszystkich akapitów
    const paragraphs = Array.from(doc.querySelectorAll("p"));

    // Wyodrębnij treść każdego akapitu
    const sentences = paragraphs.map((p) => p.outerHTML);
    console.log(sentences);

    if (sentences.length === 0) {
      console.error("Nie znaleziono akapitów w treści przed nagłówkiem.");
      return;
    }

    // Podział na dwie części
    const midpoint = Math.ceil(sentences.length / 2);
    console.log(midpoint);
    const opis1Parts = sentences.slice(0, midpoint); // Pierwsza połowa
    const opis2Parts = sentences.slice(midpoint); // Druga połowa

    const opis1 = opis1Parts.join(" "); // Połącz akapity w string HTML
    console.log(opis1);
    const opis2 = opis2Parts.join(" "); // Połącz akapity w string HTML

    if (!afterIngredients.includes(header2)) {
      console.error(
        toast.error(`Nagłówek "${header2}" nie został znaleziony w części po "${header1}".`)
      );
      return;
    }

    const [ingredientsToPurpose, restAfterPurpose] =
      afterIngredients.split(header2);

    const opis3 = `${header1}${ingredientsToPurpose}`;
    const opis4 = `${header2}${restAfterPurpose}`;

    // Podział na zdania

    function processHtml(html1, html2) {
      function splitAndWrap(html) {
        // Usuń znaczniki <p> i </p> z początku i końca
        const content = html.replace(/^<p>|<\/p>$/g, '');
    
        // Podziel na zdania używając kropki, wykrzyknika lub znaku zapytania jako separatorów
        const sentences = content.split(/(?<=[.!?])\s+/);
    
        // Podziel zdania na części w zależności od liczby elementów
        let parts;
        if (sentences.length <= 4) {
          const mid = Math.ceil(sentences.length / 2);
          const part1 = sentences.slice(0, mid).join(' ');
          const part2 = sentences.slice(mid).join(' ');
          parts = [part1, part2];
        } else {
          const part1 = sentences.slice(0, Math.ceil(sentences.length / 3)).join(' ');
          const part2 = sentences.slice(Math.ceil(sentences.length / 3), Math.ceil(2 * sentences.length / 3)).join(' ');
          const part3 = sentences.slice(Math.ceil(2 * sentences.length / 3)).join(' ');
          parts = [part1, part2, part3];
        }
    
        // Dodaj znaczniki <p> na początku i </p> na końcu każdej części
        const wrappedParts = parts.map(part => `<p>${part}</p>`);
    
        // Połącz części w jeden string
        return wrappedParts.join('');
      }
    
      const result1 = splitAndWrap(html1);
      const result2 = splitAndWrap(html2);
    
      return { result1, result2 };
    }

    const result = processHtml(opis1, opis2);

    // Zapisz do Redux z uwzględnieniem wielojęzycznej struktury
    dispatch(
      updateProduct({
        cosmeticsDescription1: {
          pl: result.result1,
          en: "",
          de: "",
          fr: "",
          it: ""
        },
        cosmeticsDescription2: {
          pl: result.result2,
          en: "",
          de: "",
          fr: "",
          it: ""
        },
        cosmeticsDescription3: {
          pl: opis3,
          en: "",
          de: "",
          fr: "",
          it: ""
        },
        cosmeticsDescription4: {
          pl: opis4,
          en: "",
          de: "",
          fr: "",
          it: ""
        },
      })
    );

    toast.success("Kod HTML został podzielony");
  }

  const handleReset = () => {
    if (editor) {
      editor.commands.setContent("");
      setCleanedHtml("");
      dispatch(
        updateProduct({
          cosmeticsDescription1: {
            pl: "",
            en: "",
            de: ""
          },
          cosmeticsDescription2: {
            pl: "",
            en: "",
            de: ""
          },
          cosmeticsDescription3: {
            pl: "",
            en: "",
            de: ""
          },
          cosmeticsDescription4: {
            pl: "",
            en: "",
            de: ""
          },
        })
      );
    }
    toast.success("Podział został zresetowany");
  };

  useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent("");
      dispatch(updateProduct({ 
        cosmeticsDescription1: {
          pl: "",
          en: "",
          de: ""
        },
        cosmeticsDescription2: {
          pl: "",
          en: "",
          de: ""
        },
        cosmeticsDescription3: {
          pl: "",
          en: "",
          de: ""
        },
        cosmeticsDescription4: {
          pl: "",
          en: "",
          de: ""
        }
      }));
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
              console.error("cleanedHtml jest puste lub niezdefiniowane.");
              return;
            }
            splitHtmlContent(cleanedHtml);
          }}
        >
          Podziel
        </Button>
        <Button onClick={handleReset} className={style.textEditorContainer__btnRed}>Resetuj podział</Button>
      </div>
    </div>
  );
};