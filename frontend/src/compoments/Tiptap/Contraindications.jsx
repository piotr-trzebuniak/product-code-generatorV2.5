import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import style from "./TextEditor.module.scss";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";

export const Contraindications = ({ onReset }) => {
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.product);
  
  const contentText = `<p>Nadwrażliwość na którykolwiek ze składników preparatu. W okresie ciąży i karmienia piersią przed zastosowaniem należy skonsultować się z lekarzem lub farmaceutą.</p>`;

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: productData.contraindications?.pl || contentText,

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      dispatch(
        updateProduct({
          contraindications: {
            ...productData.contraindications,
            pl: html,
          },
        })
      );
    },
  });

  // Dodany useEffect do synchronizacji edytora z danymi Redux
  React.useEffect(() => {
    if (editor && (productData.contraindications?.pl || contentText) !== editor.getHTML()) {
      editor.commands.setContent(productData.contraindications?.pl || contentText);
    }
  }, [productData.contraindications?.pl, editor, contentText]);

  React.useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent(contentText); // Resetuj zawartość edytora
      dispatch(
        updateProduct({
          contraindications: {
            pl: contentText,
            en: "",
            de: "",
          },
        })
      ); // Poprawiony reset stanu Redux
    }
  }, [onReset, editor, dispatch, contentText]);

  return (
    <div className={style.textEditorContainer}>
      <h4>Przeciwwskazania</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};