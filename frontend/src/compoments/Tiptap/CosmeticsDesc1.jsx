import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import style from "./TextEditor.module.scss";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";

export const CosmeticsDesc1 = ({ onReset }) => {
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.product);

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
    content: productData.cosmeticsDescription1?.pl || "",

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleanedHtml = removePTagsFromLists(html);

      dispatch(
        updateProduct({
          cosmeticsDescription1: {
            ...productData.cosmeticsDescription1,
            pl: cleanedHtml,
          },
        })
      );
    },
  });

  useEffect(() => {
    // Resetowanie zawartości edytora w przypadku zmiany produktu
    if (editor && (productData.cosmeticsDescription1?.pl || "") !== editor.getHTML()) {
      editor.commands.setContent(productData.cosmeticsDescription1?.pl || "");
    }
  }, [productData.cosmeticsDescription1?.pl, editor]);

  useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent(""); // Resetuj zawartość edytora
      dispatch(
        updateProduct({
          cosmeticsDescription1: {
            pl: "",
            en: "",
            de: "",
          },
        })
      ); // Poprawiony reset stanu Redux
    }
  }, [onReset, editor, dispatch]);

  return (
    <div className={style.textEditorContainer}>
      <h4>Akapit 1</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};