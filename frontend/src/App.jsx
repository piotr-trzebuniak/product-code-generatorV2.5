
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCodeGenerator from "./pages/ProductCodeGenerator/ProductCodeGenerator";

function App() {
  return (
    <>
      <ToastContainer position="top-right" />
      <ProductCodeGenerator />
    </>
  );
}

export default App;
