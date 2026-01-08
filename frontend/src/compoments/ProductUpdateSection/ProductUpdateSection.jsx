import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { parsePolishHtmlToProduct } from "../../utils/parsers/parsePolishHtmlToProduct";
import { parsePolishHtmlToCosmeticsDescriptions } from "../../utils/parsers/parsePolishHtmlToCosmeticsDescriptions";
import { updateProduct } from "../../redux/productSlice";
import style from "./ProductUpdateSection.module.scss";
import Input from "../Input/Input";
import Button from "../Button/Button";

const SHEET_NAME = "IMPORT SKLEP";


const API_BASE = import.meta.env.VITE_API_URL;


const normalizeSku = (v) => String(v || "").trim().toUpperCase();

const ProductUpdateSection = () => {
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const handleFetchFromPresta = async () => {
    const skuNormalized = normalizeSku(sku);
    if (!skuNormalized) {
      toast.warn("Wpisz SKU.");
      return;
    }


    if (!API_BASE) {
      toast.error("Brak VITE_API_URL. Ustaw w frontend/.env i na Vercel.");
      return;
    }

    setIsLoading(true);
    try {
      const url = `${API_BASE}/gsheet/by-sku?sku=${encodeURIComponent(
        skuNormalized
      )}&sheet=${encodeURIComponent(SHEET_NAME)}`;

      const resp = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        if (resp.status === 404) {
          toast.warn(`Nie znaleziono SKU: ${skuNormalized} w arkuszu.`);
          return;
        }
        toast.error(data?.message || `Błąd pobierania danych z arkusza (${resp.status}).`);
        return;
      }

      // Mapowanie:
      // D -> productName
      // E -> shortDescription
      // F -> longDescription
      setSku(data?.sku ?? skuNormalized);
      setProductName(data?.D ?? "");
      setShortDescription(data?.E ?? "");
      setLongDescription(data?.F ?? "");

      toast.success("Pobrano dane z arkusza i uzupełniono pola.");
    } catch (e) {
      console.error(e);
      toast.error("Błąd połączenia z backendem (gsheet/by-sku).");
    } finally {
      setIsLoading(false);
    }
  };


  const detectHtmlType = (html) => {
    // normalizujemy HTML do "gołego tekstu", żeby nie przeszkadzały tagi, nbsp itd.
    const text = (html || "")
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const hasPackSize = text.includes("wielkość opakowania");
    const hasServing = text.includes("porcja jednorazowa");

    // Jeśli wszystkie trzy są obecne => to jest "produkt/suplement"
    if (hasPackSize && hasServing) return "product";

    // W przeciwnym razie traktuj jako kosmetyki (Twój wymóg)
    return "cosmetics";
  };



  const handleApply = () => {
    try {
      const html = longDescription || "";

      const type = detectHtmlType(html);

      console.log("Detected HTML type:", type);

      const partial =
        type === "cosmetics"
          ? parsePolishHtmlToCosmeticsDescriptions(html)
          : parsePolishHtmlToProduct(html);

      if (!partial || Object.keys(partial).length === 0) {
        toast.warn("Nie wykryto danych do aktualizacji. Sprawdź strukturę HTML.");
        return;
      }

      partial.productSku = normalizeSku(sku);
      partial.productName = { pl: productName };

      if (shortDescription.trim()) {
        partial.shortDescription = { pl: shortDescription };
      }

      dispatch(updateProduct(partial));
      toast.success(
        `Produkt został zaktualizowany na podstawie wklejonego HTML. (tryb: ${type})`
      );
    } catch (e) {
      console.error(e);
      toast.error("Błąd podczas parsowania HTML.");
    }
  };

  React.useEffect(() => {
    if (longDescription) {
      handleApply();
    }
  }, [longDescription]);


  return (
    <section>
      {/* <h3>Aktualizacja produktu</h3>

      <div className={style.checkboxes}>
        <h4>Typ aktualizacji:</h4>
        <div className={style.checkboxes__checkbox}>
          <input type="checkbox" name="gmoFree" onChange={() => { }} />
          <span>Opis</span>
        </div>
        <div className={style.checkboxes__checkbox}>
          <input type="checkbox" name="gmoFree" onChange={() => { }} />
          <span>Zdjęcie</span>
        </div>
        <div className={style.checkboxes__checkbox}>
          <input type="checkbox" name="gmoFree" onChange={() => { }} />
          <span>Nazwa produktu</span>
        </div>
        <div className={style.checkboxes__checkbox}>
          <input type="checkbox" name="gmoFree" onChange={() => { }} />
          <span>Inna</span>
        </div>
      </div> */}

      <div style={{ marginBottom: 8, display: "flex", gap: "8px", alignItems: "center" }}>
        <Input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="Produkt jest już dodany do presty? Wpisz SKU i automaczynie wypełnij pola formularza!"
        />

        {/* Ten przycisk teraz pobiera dane z Sheets (a nie handleApply) */}
        <Button
          onClick={handleFetchFromPresta}
          className={style.searchBtn}
          disabled={isLoading}
        >
          {isLoading ? "Pobieram..." : "Pobierz dane z Presty"}
        </Button>
      </div>

      {/* <div style={{ marginBottom: 8 }}>
        <Input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Nazwa produktu"
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <Input
          value={shortDescription}
          className={style.input}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Krótki opis (HTML)..."
          rows={6}
          style={{ width: "100%", height: "100px" }}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <Input
          className={style.input}
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          placeholder="Długi opis (HTML)..."
          rows={12}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <Button onClick={handleApply}>Autouzupełnianie pól formularza</Button>
      </div> */}
    </section>
  );
};

export default ProductUpdateSection;
