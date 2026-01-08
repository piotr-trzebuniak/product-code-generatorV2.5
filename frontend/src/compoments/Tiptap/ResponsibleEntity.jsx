import { useEditor, EditorContent } from "@tiptap/react";
import style from './TextEditor.module.scss'
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";
import { useEffect } from "react";

export const ResponsibleEntity = ({ initialContent }) => {
  const dispatch = useDispatch()
  const productData = useSelector((state) => state.product.product);

  function mergeParagraphsToSingleWithBreaks(input) {
    // Znajdź wszystkie treści wewnątrz znaczników <p>...</p>
    const matches = input.match(/<p>(.*?)<\/p>/g);
  
    if (!matches) {
      return input; // Jeśli nie znaleziono znaczników <p>, zwróć oryginalny kod
    }
  
    // Usuń znaczniki <p> i </p> z każdego fragmentu, a następnie połącz je przy użyciu <br/>
    const mergedContent = matches
      .map(p => p.replace(/<\/?p>/g, ''))
      .join('<br>');
  
    // Umieść złączoną treść wewnątrz jednego znacznika <p>...</p>
    return `${mergedContent}`;
  }

  // Sprawdź, czy productData.responsibleEntity jest obiektem, i jeśli tak, użyj pola bl
  const getResponsibleEntityContent = () => {
    if (typeof productData.responsibleEntity === 'object' && productData.responsibleEntity !== null) {
      return productData.responsibleEntity.bl || "";
    }
    return productData.responsibleEntity || "";
  };

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent || getResponsibleEntityContent(),

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const shopHtml = mergeParagraphsToSingleWithBreaks(html);
      
      // Zachowaj obecną strukturę danych
      if (typeof productData.responsibleEntity === 'object' && productData.responsibleEntity !== null) {
        dispatch(updateProduct({ 
          responsibleEntity: { 
            shop: shopHtml,
            bl: html
          } 
        }));
      } else {
        // Jeśli responsibleEntity nie jest obiektem, zapisuj jako string
        dispatch(updateProduct({ responsibleEntity: html }));
      }
    },
  });

  useEffect(() => {
    if (editor) {
      const currentContent = getResponsibleEntityContent();
      if (currentContent !== editor.getHTML()) {
        editor.commands.setContent(currentContent);
      }
    }
  }, [productData.responsibleEntity, editor]); 

  return (
    <div className={style.textEditorContainer}>
      <h4>Podmiot odpowiedzialny</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};