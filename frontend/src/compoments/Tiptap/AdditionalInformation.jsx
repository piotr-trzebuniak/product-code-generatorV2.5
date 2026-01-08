import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import style from "./TextEditor.module.scss";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";

export const AdditionalInformation = ({ onReset }) => {
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.product);
  const contentText = `<p>Produkt nie może być stosowany jako substytut (zamiennik) prawidłowo zróżnicowanej diety. Zrównoważony sposób żywienia i prawidłowy tryb życia jest ważny dla funkcjonowania organizmu człowieka. Nie należy przekraczać maksymalnej zalecanej porcji do spożycia w ciągu dnia.</p>`;

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: productData.additionalInformation?.pl || contentText,

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      dispatch(
        updateProduct({
          additionalInformation: {
            ...productData.additionalInformation,
            pl: html,
          },
        })
      );
    },
  });

  // Dodany useEffect do synchronizacji edytora z danymi Redux
  React.useEffect(() => {
    if (editor && (productData.additionalInformation?.pl || contentText) !== editor.getHTML()) {
      editor.commands.setContent(productData.additionalInformation?.pl || contentText);
    }
  }, [productData.additionalInformation?.pl, editor, contentText]);

  React.useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent(contentText); // Resetuj zawartość edytora
      dispatch(
        updateProduct({
          additionalInformation: {
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
      <h4>Informacja</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};