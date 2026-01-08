import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import style from './TextEditor.module.scss'
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";


export const HowToUse = ({onReset}) => {
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.product);

  function removePTagsFromLists(html) {
    // Usuwamy wszystkie znaczniki <p> oraz </p> pomiędzy <ul> i </ul> oraz <ol> i </ol>
    return html.replace(/(<ul[\s\S]*?>|<ol[\s\S]*?>)([\s\S]*?)(<\/ul>|<\/ol>)/g, (match, openTag, content, closeTag) => {
      // Usuwamy znaczniki <p> oraz </p> tylko wewnątrz list
      const cleanedContent = content.replace(/<\/?p>/g, "");
      // Zwracamy całą strukturę z wyczyszczonymi <p>
      return `${openTag}${cleanedContent}${closeTag}`;
    });
  }

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: productData.howToUse?.pl || ``,

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleanedHtml = removePTagsFromLists(html);

      dispatch(updateProduct({ 
        howToUse: {
          ...productData.howToUse,
          pl: cleanedHtml 
        }
      }));
    },
  });

  React.useEffect(() => {
    // Aktualizuj edytor po zmianie danych
    if (editor && (productData.howToUse?.pl || "") !== editor.getHTML()) {
      editor.commands.setContent(productData.howToUse?.pl || "");
    }
  }, [productData.howToUse?.pl, editor]);

  React.useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent(''); // Resetuj zawartość edytora
      dispatch(updateProduct({ 
        howToUse: {
          pl: "",
          en: "",
          de: "" 
        }
      })); // Resetuj stan Redux
    }
  }, [onReset, editor, dispatch]);

  return (
    <div className={style.textEditorContainer}>
      <h4>Sposób użycia:</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};