import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import style from './TextEditor.module.scss'
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";

export const TableEnd = ({onReset}) => {
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.product);
  
  const defaultContent = `<p><b>RWS</b> - Dzienna referencyjna wartość spożycia</p>
  <p><b>&lt;&gt;</b> Nie ustalono dziennej referencyjnej wartości spożycia</p>`;

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: productData.tableEnd?.pl || defaultContent,

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      dispatch(updateProduct({ 
        tableEnd: {
          ...productData.tableEnd,
          pl: html 
        }
      }));
    },
  });

  React.useEffect(() => {
    // Aktualizuj edytor po zmianie danych
    if (editor && (productData.tableEnd?.pl || defaultContent) !== editor.getHTML()) {
      editor.commands.setContent(productData.tableEnd?.pl || defaultContent);
    }
  }, [productData.tableEnd?.pl, editor, defaultContent]);

  React.useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent(defaultContent); // Resetuj zawartość edytora
      dispatch(updateProduct({ 
        tableEnd: {
          pl: defaultContent,
          en: "",
          de: "" 
        }
      })); // Resetuj stan Redux
    }
  }, [onReset, editor, dispatch, defaultContent]);

  return (
    <div className={style.textEditorContainer}>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};