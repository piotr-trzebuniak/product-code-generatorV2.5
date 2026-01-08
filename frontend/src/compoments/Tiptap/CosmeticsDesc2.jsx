import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import style from "./TextEditor.module.scss";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";

export const CosmeticsDesc2 = ({ onReset }) => {
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
    content: productData.cosmeticsDescription2?.pl || "",

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleanedHtml = removePTagsFromLists(html);

      dispatch(updateProduct({
        cosmeticsDescription2: {
          ...productData.cosmeticsDescription2,
          pl: cleanedHtml
        }
      }));
    },
  });

  useEffect(() => {
    if (editor && (productData.cosmeticsDescription2?.pl || "") !== editor.getHTML()) {
      editor.commands.setContent(productData.cosmeticsDescription2?.pl || "");
    }
  }, [productData.cosmeticsDescription2?.pl, editor]);

  useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent(""); // Resetuj edytor
      dispatch(updateProduct({
        cosmeticsDescription2: {
          pl: "",
          en: "",
          de: ""
        }
      }));
    }
  }, [onReset, editor, dispatch]);

  return (
    <div className={style.textEditorContainer}>
      <h4>Akapit 2</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
