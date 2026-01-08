import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import style from './TextEditor.module.scss'
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";

export const CosmeticsDesc3 = ({onReset}) => {
  const dispatch = useDispatch()
  const productData = useSelector((state) => state.product.product);

  function removePTagsFromLists(html) {
    // Usuwamy wszystkie znaczniki <p> oraz </p> pomiędzy <ul> i </ul> oraz <ol> i </ol>
    return html.replace(/(<ul[\s\S]*?>|<ol[\s\S]*?>)([\s\S]*?)(<\/ul>|<\/ol>)/g, (match, openTag, content, closeTag) => {
      // Usuwamy znaczniki <p> oraz </p> tylko wewnątrz list
      const cleanedContent = content.replace(/<\/?p>/g, "");
      console.log('test')
      // Zwracamy całą strukturę z wyczyszczonymi <p>
      return `${openTag}${cleanedContent}${closeTag}`;
    });
  }

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: productData.cosmeticsDescription3?.pl || "",

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleanedHtml = removePTagsFromLists(html);

      dispatch(updateProduct({ 
        cosmeticsDescription3: {
          ...productData.cosmeticsDescription3,
          pl: cleanedHtml 
        }
      }));
    },
  });

  useEffect(() => {
    // Resetowanie zawartości edytora w przypadku zmiany produktu
    if (editor && (productData.cosmeticsDescription3?.pl || "") !== editor.getHTML()) {
      editor.commands.setContent(productData.cosmeticsDescription3?.pl || "");
    }
  }, [productData.cosmeticsDescription3?.pl, editor]);

  useEffect(() => {
    if (onReset && editor) {
      editor.commands.setContent(''); // Resetuj zawartość edytora
      dispatch(updateProduct({ 
        cosmeticsDescription3: {
          pl: "",
          en: "",
          de: "" 
        }
      })); // Resetuj stan Redux
    }
  }, [onReset, editor, dispatch]);

  return (
    <div className={style.textEditorContainer}>
      <h4>Akapit 3</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};