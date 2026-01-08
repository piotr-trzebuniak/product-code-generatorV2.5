import { useEditor, EditorContent } from "@tiptap/react";
import style from './TextEditor.module.scss'
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import MenuBar from "./MenuBar";
import { useEffect } from "react";

export const Producer = ({ initialContent }) => {
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
    return `<p>${mergedContent}</p>`;
  }

  // Sprawdź, czy productData.producer jest obiektem, i jeśli tak, użyj pola bl
  const getProducerContent = () => {
    if (typeof productData.producer === 'object' && productData.producer !== null) {
      return productData.producer.bl || "";
    }
    return productData.producer || "";
  };

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent || getProducerContent(),
    
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const shopHtml = mergeParagraphsToSingleWithBreaks(html);

      // Zachowaj obecną strukturę danych producenta
      if (typeof productData.producer === 'object' && productData.producer !== null) {
        dispatch(updateProduct({ 
          producer: { 
            shop: shopHtml,
            bl: html
          } 
        }));
      } else {
        // Jeśli producer nie jest obiektem, zapisuj jako string
        dispatch(updateProduct({ producer: html }));
      }
    },
  });

  useEffect(() => {
    if (editor) {
      const currentContent = getProducerContent();
      if (currentContent !== editor.getHTML()) {
        editor.commands.setContent(currentContent);
      }
    }
  }, [productData.producer, editor]); 

  return (
    <div className={style.textEditorContainer}>
      <h4>Producent</h4>
      <div className="textEditor">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};