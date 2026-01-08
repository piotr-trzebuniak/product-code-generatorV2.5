import React, { useEffect, useState } from "react";
import style from "./TextEditor.module.scss";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";

export const Bulletpoints = ({ initialContent, onReset }) => {
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.product);
  const [editorContent, setEditorContent] = useState("");

  function removePTagsFromLists(html) {
    return html.replace(
      /(<ul[\s\S]*?>|<ol[\s\S]*?>)([\s\S]*?)(<\/ul>|<\/ol>)/g,
      (match, openTag, content, closeTag) => {
        const cleanedContent = content.replace(/<\/?p>/g, "");
        return `${openTag}${cleanedContent}${closeTag}`;
      }
    );
  }

  // Proces inicjalizacji zawartości edytora 
  useEffect(() => {
    let content = "";
    
    if (initialContent && typeof initialContent === 'string') {
      content = initialContent;
    } else if (productData.bulletpoints) {
      if (typeof productData.bulletpoints === 'string') {
        content = productData.bulletpoints;
      } else if (typeof productData.bulletpoints === 'object' && productData.bulletpoints.pl) {
        content = productData.bulletpoints.pl;
      }
    }
    
    setEditorContent(content);
  }, [initialContent, productData.bulletpoints]);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: editorContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleanedHtml = removePTagsFromLists(html);

      if (typeof productData.bulletpoints === 'object' && productData.bulletpoints !== null) {
        dispatch(
          updateProduct({
            bulletpoints: {
              ...productData.bulletpoints,
              pl: cleanedHtml,
            },
          })
        );
      } else {
        dispatch(
          updateProduct({
            bulletpoints: cleanedHtml,
          })
        );
      }
    },
  });

  // Aktualizacja zawartości edytora przy zmianie editorContent
  useEffect(() => {
    if (editor && editorContent !== editor.getHTML()) {
      editor.commands.setContent(editorContent);
    }
  }, [editorContent, editor]);

  useEffect(() => {
    if (onReset && editor) {
      setEditorContent('');
      
      if (typeof productData.bulletpoints === 'object' && productData.bulletpoints !== null) {
        dispatch(
          updateProduct({
            bulletpoints: {
              pl: "",
              en: "",
              de: "",
            },
          })
        );
      } else {
        dispatch(
          updateProduct({
            bulletpoints: "",
          })
        );
      }
    }
  }, [onReset, editor, dispatch, productData.bulletpoints]);

  return (
    <div className={style.textEditorContainer}>
      <h4>Dlaczego warto stosować?</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};