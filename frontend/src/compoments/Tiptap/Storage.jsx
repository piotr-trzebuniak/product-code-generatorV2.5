import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import style from './TextEditor.module.scss'
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";


export const Storage = ({onReset}) => {
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.product);
  const contentText = `<p>Przechowywać w suchym i ciemnym miejscu, w temperaturze 0-25ºC, w sposób niedostępny dla małych dzieci.</p>`;

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: productData.storage?.pl || contentText,

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      dispatch(updateProduct({ 
        storage: {
          ...productData.storage,
          pl: html 
        }
      }));
    },
  });

  React.useEffect(() => {
    // Aktualizuj edytor po zmianie danych
    if (editor && (productData.storage?.pl || contentText) !== editor.getHTML()) {
      editor.commands.setContent(productData.storage?.pl || contentText);
    }
  }, [productData.storage?.pl, editor, contentText]);

  React.useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent(contentText); // Resetuj zawartość edytora
      dispatch(updateProduct({ 
        storage: {
          pl: contentText,
          en: "",
          de: "" 
        }
      })); // Resetuj stan Redux
    }
  }, [onReset, editor, dispatch, contentText]);

  return (
    <div className={style.textEditorContainer}>
      <h4>Przechowywanie</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};