import React, { useEffect, useState } from "react";
import style from "./ProductCodeGenerator.module.scss";
import Button from "../../compoments/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { resetProduct, updateProduct } from "../../redux/productSlice";
import { toast } from "react-toastify";
import SupplementsForm from "./SupplementsForm/SupplementsForm";
import CosmeticsForm from "./CosmeticsForm/CosmeticsForm";
import GeneratorBtns from "./GeneratorBtns/GeneratorBtns";
import { initialState } from "../../redux/productSlice";
import { generateBlHtml } from "../../utils/htmlTemplatesFunctions/allegroBL/generateBlHtml";
import {
  generateShopHtml,
  replaceH2WithH3,
  replaceH3WithH2,
} from "../../utils/htmlTemplatesFunctions/shopPL/generateShopHtml";
import { generateCosmeticsShopHtml } from "../../utils/htmlTemplatesFunctions/shopPL/generateCosmeticsShopHtml";
import { generateCosmeticsBlHtml } from "../../utils/htmlTemplatesFunctions/allegroBL/generateCosmeticsBlHtml";
import { translateAllFields, translateText } from "../../utils/translations";
import { generateEbayDeHtml } from "../../utils/htmlTemplatesFunctions/ebay/DE/generateEbayDeHtml";
import { generateEbayDeHtmlCosmetics } from "../../utils/htmlTemplatesFunctions/ebay/DE/generateEbayDeHtmlCosmetics";
import { generateEbayEnHtml } from "../../utils/htmlTemplatesFunctions/ebay/EN/generateEbayEnHtml";
import { generateEbayEnHtmlCosmetics } from "../../utils/htmlTemplatesFunctions/ebay/EN/generateEbayEnHtmlCosmetics";
import { generateEbayFrHtml } from "../../utils/htmlTemplatesFunctions/ebay/FR/generateEbayFrHtml";
import { generateEbayFrHtmlCosmetics } from "../../utils/htmlTemplatesFunctions/ebay/FR/generateEbayFrHtmlCosmetics";
import { generateEbayItHtml } from "../../utils/htmlTemplatesFunctions/ebay/IT/generateEbayItHtml";
import { generateEbayItHtmlCosmetics } from "../../utils/htmlTemplatesFunctions/ebay/IT/generateEbayItHtmlCosmetics";
import { validateMandatoryFields } from "../../utils/validateMandatoryFields";
import { generateShopify } from "../../utils/htmlTemplatesFunctions/shopify/generateShopify";
import { generateShopifyCosmetics } from "../../utils/htmlTemplatesFunctions/shopify/generateShopifyCosmetics";
import { generateEmagRo } from "../../utils/htmlTemplatesFunctions/emag/RO/generateEmagRo";
import { generateEmagRoCosmetics } from "../../utils/htmlTemplatesFunctions/emag/RO/generateEmagRoCosmetics";
import ProductUpdateSection from "../../compoments/ProductUpdateSection/ProductUpdateSection";
// import { splitHtml } from "../../utils/splitHtml";

const ProductCodeGenerator = () => {
  const [htmlToShop, setHtmlToShop] = useState("");
  const [htmlToBl, setHtmlToBl] = useState("");
  const [htmlToEbayDe, setHtmlToEbayDe] = useState("");
  const [htmlToEbayEn, setHtmlToEbayEn] = useState("");
  const [htmlToEbayFr, setHtmlToEbayFr] = useState("");
  const [htmlToEbayIt, setHtmlToEbayIt] = useState("");
  const [htmlToShopify, setHtmlToShopify] = useState("");
  const [htmlToEmagRo, setHtmlToEmagRo] = useState("");
  const [type, setType] = useState("");
  const [type2, setType2] = useState("add");
  const [key, setKey] = useState(0);
  const [description, setDescription] = useState("");
  const [resetKey, setResetKey] = useState(false);

  // Stany do zarządzania przepływem interfejsu
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translateSkipped, setTranslateSkipped] = useState(false);
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);
  const [isSendingToSheets, setIsSendingToSheets] = useState(false);
  const [isDataSentToSheets, setIsDataSentToSheets] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  const [operationType, setOperationType] = useState(null);

  function replaceStrongWithB(htmlString) {
    return htmlString
      .replace(/<strong>/g, "<b>")
      .replace(/<\/strong>/g, "</b>");
  }

  const [areMandatoryFieldsFilled, setAreMandatoryFieldsFilled] =
    useState(false);
  const [missingMandatoryFields, setMissingMandatoryFields] = useState([]);

  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.product);

  const checkMandatoryFields = () => {
    if (!type) return false;

    const validation = validateMandatoryFields(productData, type);
    setMissingMandatoryFields(validation.missingFields);
    setAreMandatoryFieldsFilled(validation.isValid);

    return validation.isValid;
  };

  useEffect(() => {
    if (type) {
      checkMandatoryFields();
    }
  }, [productData, type]);

  // TRANSLATIONS FUNCTIONS

  const handleTranslate = async () => {
    if (!checkMandatoryFields()) {
      toast.error(
        `Uzupełnij obowiązkowe pola: ${missingMandatoryFields.join(", ")}`
      );
      return;
    }

    setIsTranslating(true);
    setIsTranslated(false);
    setTranslationError(null);

    try {
      // Użyj zmodyfikowanej funkcji translateAllFields
      const translatedData = await translateAllFields(
        productData,
        initialState,
        setIsTranslating // Przekazujemy funkcję set do zarządzania stanem ładowania
      );

      // Po zakończeniu całego procesu tłumaczenia
      setTranslationError(null);
      dispatch(updateProduct(translatedData));
      toast.success("Dane zostały przetłumaczone 🎉");
      setIsTranslating(false);
      setIsTranslated(true);
      {
        console.log("Debug:", {
          isTranslated,
          translateSkipped,
          isTranslating,
        });
      }
    } catch (error) {
      setIsTranslating(false);
      setTranslationError(error.message || "Nieznany błąd tłumaczenia");
      toast.error(`Błąd tłumaczenia: ${error.message || "Nieznany błąd"}`);
      console.error("Błąd tłumaczenia:", error);
    }
  };
  useEffect(() => {
    if (isTranslated) {
      console.log("Translation is complete, now isTranslated is true");
    }
  }, [isTranslated]);
  {
    console.log("Debug:", { isTranslated, translateSkipped, isTranslating });
  }

  const skipTranslation = () => {
    toast.info("Tłumaczenie zostało pominięte");
    console.log(productData);
    setTranslateSkipped(true);
    setTranslationError(null);
  };

  // ACTIONS FUNCTIONS

  const copyHtmlToShop = async () => {
    if (htmlToShop) {
      try {
        await navigator.clipboard.writeText(htmlToShop);
        console.log("Kod HTML dla sklepu skopiowany do schowka.");
        toast.success("Kod HTML dla sklepu skopiowany do schowka.");
      } catch (err) {
        console.error("Nie udało się skopiować kodu HTML dla sklepu:", err);
      }
    } else {
      console.log("Brak wygenerowanego kodu HTML dla sklepu.");
    }
  };

  const copyShortDescToShop = async () => {
    if (productData.shortDescription.pl) {
      try {
        await navigator.clipboard.writeText(productData.shortDescription.pl);
        console.log("Kod krótkiego opisu dla sklepu skopiowany do schowka.");
        toast.success("Kod krótkiego opisu dla sklepu skopiowany do schowka.");
      } catch (err) {
        console.error(
          "Nie udało się skopiować kodu krótkiego opisu dla sklepu:",
          err
        );
      }
    } else {
      toast.error("Brak wygenerowanego kodu krótkiego opisu dla sklepu.");
    }
  };

  const copyHtmlToShopAndShortDesc = async () => {
    if (htmlToShop && productData.shortDescription.pl) {
      const htmlToShopAndShortDesc =
        productData.shortDescription.pl + htmlToShop;
      try {
        await navigator.clipboard.writeText(htmlToShopAndShortDesc);
        console.log(
          "Kod HTML krótkiego opisu dla sklepu + Kod HTML dla sklepu skopiowany do schowka."
        );
        toast.success(
          "Kod HTML krótkiego opisu dla sklepu + Kod HTML dla sklepu skopiowany do schowka."
        );
      } catch (err) {
        console.error(
          "Nie udało się skopiować kodu HTML krótkiego opisu dla sklepu + kodu HTML dla sklepu:",
          err
        );
      }
    } else {
      console.log(
        "Brak wygenerowanego kodu HTML krótkiego opisu dla sklepu + kodu HTML dla sklepu."
      );
    }
  };

  const copyHtmlToBl = async () => {
    if (htmlToBl) {
      try {
        await navigator.clipboard.writeText(htmlToBl);
        console.log("Kod HTML dla Baselinkera skopiowany do schowka.");
        toast.success("Kod HTML dla baselinkera skopiowany do schowka.");
      } catch (err) {
        console.error(
          "Nie udało się skopiować kodu HTML dla Baselinkera:",
          err
        );
      }
    } else {
      toast.error("Brak kodu HTML do skopiowania.");
    }
  };
  const copyHtmlToEbayDe = async () => {
    if (htmlToEbayDe) {
      try {
        await navigator.clipboard.writeText(htmlToEbayDe);
        console.log("Kod HTML dla Ebay DE skopiowany do schowka.");
        toast.success("Kod HTML dla Ebay DE skopiowany do schowka.");
      } catch (err) {
        console.error("Nie udało się skopiować kodu HTML dla Ebay DE:", err);
      }
    } else {
      toast.error("Brak kodu HTML do skopiowania.");
    }
  };
  const copyHtmlToEbayEn = async () => {
    if (htmlToEbayEn) {
      try {
        await navigator.clipboard.writeText(htmlToEbayEn);
        console.log("Kod HTML dla Ebay EN skopiowany do schowka.");
        toast.success("Kod HTML dla Ebay EN skopiowany do schowka.");
      } catch (err) {
        console.error("Nie udało się skopiować kodu HTML dla Ebay EN:", err);
      }
    } else {
      toast.error("Brak kodu HTML do skopiowania.");
    }
  };
  const copyHtmlToEbayFr = async () => {
    if (htmlToEbayFr) {
      try {
        await navigator.clipboard.writeText(htmlToEbayFr);
        console.log("Kod HTML dla Ebay FR skopiowany do schowka.");
        toast.success("Kod HTML dla Ebay FR skopiowany do schowka.");
      } catch (err) {
        console.error("Nie udało się skopiować kodu HTML dla Ebay FR:", err);
      }
    } else {
      toast.error("Brak kodu HTML do skopiowania.");
    }
  };
  const copyHtmlToEbayIt = async () => {
    if (htmlToEbayIt) {
      try {
        await navigator.clipboard.writeText(htmlToEbayIt);
        console.log("Kod HTML dla Ebay IT skopiowany do schowka.");
        toast.success("Kod HTML dla Ebay IT skopiowany do schowka.");
      } catch (err) {
        console.error("Nie udało się skopiować kodu HTML dla Ebay IT:", err);
      }
    } else {
      toast.error("Brak kodu HTML do skopiowania.");
    }
  };
  const copyHtmlToEmagRo = async () => {
    if (htmlToEmagRo) {
      try {
        await navigator.clipboard.writeText(htmlToEmagRo);
        console.log("Kod HTML dla EMAG RO skopiowany do schowka.");
        toast.success("Kod HTML dla EMAG RO skopiowany do schowka.");
      } catch (err) {
        console.error("Nie udało się skopiować kodu HTML dla EMAG RO:", err);
      }
    } else {
      toast.error("Brak kodu HTML do skopiowania.");
    }
  };

  const resetForm = () => {
    dispatch(resetProduct());
    setKey((prevKey) => prevKey + 1);

    setHtmlToShop("");
    setHtmlToBl("");
    setHtmlToEbayDe("");
    setHtmlToEbayEn("");
    setHtmlToEbayFr("");
    setHtmlToEbayIt("");
    setHtmlToShopify("");
    setHtmlToEmagRo("");
    setResetKey((prevKey) => !prevKey);

    // Reset stanów interfejsu
    setIsTranslating(false);
    setIsTranslated(false);
    setTranslateSkipped(false);
    setTranslationError(null);
    setIsCodeGenerated(false);
    setIsSendingToSheets(false);
    setIsDataSentToSheets(false);

    toast.success("Formularz został zresetowany");
  };

  // API CONNECTIONS

const callSplitHtmlFromBackend = async (html) => {
  const API_URL = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(`${API_URL}/split-html`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) throw new Error("Błąd podczas parsowania HTML");

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error("Błąd pobierania danych z /split-html:", error);
    toast.error("Nie udało się sparsować HTML na backendzie.");
    return null;
  }
};


const sendToGoogleSheets = async () => {
  setIsSendingToSheets(true);
  setIsDataSentToSheets(false);

  const API_URL = import.meta.env.VITE_API_URL;
  if (!API_URL) {
    toast.error("Brak VITE_API_URL. Ustaw w frontend/.env i na Vercel.");
    setIsSendingToSheets(false);
    return;
  }

  const payloads = [
    {
      Sku: productData.productSku,
      Html: htmlToBl,
      target: "baselinker",
      Type: operationType,
      ProductName: productData.productName.pl,
    },
    {
      Sku: productData.productSku,
      Html: htmlToEbayDe,
      ProductName: productData.productName.de,
      Type: operationType,
      LogoAndMenu: productData.ebayDE.logoAndMenu,
      Gallery: productData.ebayDE.gallery,
      ShortDescription: productData.ebayDE.shortDescription,
      Bulletpoints: productData.ebayDE.bulletpoints,
      Icons: productData.ebayDE.icons,
      LongDescription: productData.ebayDE.longDescription,
      Research: productData.ebayDE.research,
      ProductSeries: productData.ebayDE.productSeries,
      CategoryID: productData.categoryID,
      target: "ebay-de",
    },
    {
      Sku: productData.productSku,
      Html: htmlToEbayEn,
      ProductName: productData.productName.en,
      Type: operationType,
      LogoAndMenu: productData.ebayEN.logoAndMenu,
      Gallery: productData.ebayEN.gallery,
      ShortDescription: productData.ebayEN.shortDescription,
      Bulletpoints: productData.ebayEN.bulletpoints,
      Icons: productData.ebayEN.icons,
      LongDescription: productData.ebayEN.longDescription,
      Research: productData.ebayEN.research,
      ProductSeries: productData.ebayEN.productSeries,
      CategoryID: productData.categoryID,
      target: "ebay-en",
    },
    {
      Sku: productData.productSku,
      Html: htmlToEbayFr,
      ProductName: productData.productName.fr,
      Type: operationType,
      LogoAndMenu: productData.ebayFR.logoAndMenu,
      Gallery: productData.ebayFR.gallery,
      ShortDescription: productData.ebayFR.shortDescription,
      Bulletpoints: productData.ebayFR.bulletpoints,
      Icons: productData.ebayFR.icons,
      LongDescription: productData.ebayFR.longDescription,
      Research: productData.ebayFR.research,
      ProductSeries: productData.ebayFR.productSeries,
      CategoryID: productData.categoryID,
      target: "ebay-fr",
    },
    {
      Sku: productData.productSku,
      Html: htmlToEbayIt,
      ProductName: productData.productName.it,
      Type: operationType,
      LogoAndMenu: productData.ebayIT.logoAndMenu,
      Gallery: productData.ebayIT.gallery,
      ShortDescription: productData.ebayIT.shortDescription,
      Bulletpoints: productData.ebayIT.bulletpoints,
      Icons: productData.ebayIT.icons,
      LongDescription: productData.ebayIT.longDescription,
      Research: productData.ebayIT.research,
      ProductSeries: productData.ebayIT.productSeries,
      CategoryID: productData.categoryID,
      target: "ebay-it",
    },
    {
      Sku: productData.productSku,
      Html: htmlToShopify,
      ProductName: productData.productName.en,
      target: "shopify",
    },
    {
      Sku: productData.productSku,
      Html: htmlToEmagRo,
      ProductName: productData.productName.ro,
      Type: operationType,
      target: "emag-ro",
    },
  ];

  try {
    for (const payload of payloads) {
      toast.info(`Wysyłanie payloadu: ${payload.target}`);
      console.log("Wysyłanie payloadu:", payload);

      const response = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || `Błąd backendu (${response.status})`);
      }

      toast.success(`Wysłano do arkusza ${payload.target}`);
      console.log(`Wysłano do arkusza ${payload.target}:`, result);
    }

    setIsSendingToSheets(false);
    setIsDataSentToSheets(true);
    toast.success("Wszystkie dane zostały poprawnie wysłane do arkuszy!");
  } catch (error) {
    console.error("Błąd wysyłania do arkuszy:", error);
    setIsSendingToSheets(false);
    toast.error(`Wystąpił błąd: ${error.message || error}`);
  }
};

const sendToGoogleSheetsOnlyEbay = async () => {
  setIsSendingToSheets(true);
  setIsDataSentToSheets(false);

  const API_URL = import.meta.env.VITE_API_URL;
  if (!API_URL) {
    toast.error("Brak VITE_API_URL. Ustaw w frontend/.env i na Vercel.");
    setIsSendingToSheets(false);
    return;
  }

  const payloads = [
    {
      Sku: productData.productSku,
      Html: htmlToEbayDe,
      ProductName: productData.productName.de,
      Type: type,
      LogoAndMenu: productData.ebayDE.logoAndMenu,
      Gallery: productData.ebayDE.gallery,
      ShortDescription: productData.ebayDE.shortDescription,
      Bulletpoints: productData.ebayDE.bulletpoints,
      Icons: productData.ebayDE.icons,
      LongDescription: productData.ebayDE.longDescription,
      Research: productData.ebayDE.research,
      ProductSeries: productData.ebayDE.productSeries,
      CategoryID: productData.categoryID,
      target: "ebay-de",
    },
    {
      Sku: productData.productSku,
      Html: htmlToEbayEn,
      ProductName: productData.productName.en,
      Type: type,
      LogoAndMenu: productData.ebayEN.logoAndMenu,
      Gallery: productData.ebayEN.gallery,
      ShortDescription: productData.ebayEN.shortDescription,
      Bulletpoints: productData.ebayEN.bulletpoints,
      Icons: productData.ebayEN.icons,
      LongDescription: productData.ebayEN.longDescription,
      Research: productData.ebayEN.research,
      ProductSeries: productData.ebayEN.productSeries,
      CategoryID: productData.categoryID,
      target: "ebay-en",
    },
    {
      Sku: productData.productSku,
      Html: htmlToEbayFr,
      ProductName: productData.productName.fr,
      Type: type,
      LogoAndMenu: productData.ebayFR.logoAndMenu,
      Gallery: productData.ebayFR.gallery,
      ShortDescription: productData.ebayFR.shortDescription,
      Bulletpoints: productData.ebayFR.bulletpoints,
      Icons: productData.ebayFR.icons,
      LongDescription: productData.ebayFR.longDescription,
      Research: productData.ebayFR.research,
      ProductSeries: productData.ebayFR.productSeries,
      CategoryID: productData.categoryID,
      target: "ebay-fr",
    },
    {
      Sku: productData.productSku,
      Html: htmlToEbayIt,
      ProductName: productData.productName.it,
      Type: type,
      LogoAndMenu: productData.ebayIT.logoAndMenu,
      Gallery: productData.ebayIT.gallery,
      ShortDescription: productData.ebayIT.shortDescription,
      Bulletpoints: productData.ebayIT.bulletpoints,
      Icons: productData.ebayIT.icons,
      LongDescription: productData.ebayIT.longDescription,
      Research: productData.ebayIT.research,
      ProductSeries: productData.ebayIT.productSeries,
      CategoryID: productData.categoryID,
      target: "ebay-it",
    },
  ];

  try {
    for (const payload of payloads) {
      toast.info(`Wysyłanie payloadu: ${payload.target}`);
      console.log("Wysyłanie payloadu:", payload);

      const response = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || `Błąd backendu (${response.status})`);
      }

      toast.success(`Wysłano do arkusza ${payload.target}`);
      console.log(`Wysłano do arkusza ${payload.target}:`, result);
    }

    setIsSendingToSheets(false);
    setIsDataSentToSheets(true);
    toast.success("Wszystkie dane zostały poprawnie wysłane do arkuszy!");
  } catch (error) {
    console.error("Błąd wysyłania do arkuszy:", error);
    setIsSendingToSheets(false);
    toast.error(`Wystąpił błąd: ${error.message || error}`);
  }
};


  // SUPPLEMENTS GENERATOR FUNCTION

  const generateCode = async () => {
    if (!checkMandatoryFields()) {
      toast.error(
        `Uzupełnij obowiązkowe pola: ${missingMandatoryFields.join(", ")}`
      );
      return;
    }

    const newHtmlToShop = generateShopHtml(productData);
    const newHtmlToBl = replaceStrongWithB(generateBlHtml(productData));

    setHtmlToShop(replaceH2WithH3(newHtmlToShop));
    setHtmlToBl(replaceH3WithH2(newHtmlToBl));

    if (isTranslated) {
      const newHtmlToEbayDe = generateEbayDeHtml(productData);
      const newHtmlToEbayEn = generateEbayEnHtml(productData);
      const newHtmlToEbayFr = generateEbayFrHtml(productData);
      const newHtmlToEbayIt = generateEbayItHtml(productData);
      const newHtmlToShopify = generateShopify(productData);
      const newHtmlToEmagRo = generateEmagRo(productData);

      console.log(newHtmlToShopify);

      setHtmlToEbayDe(newHtmlToEbayDe);
      setHtmlToEbayEn(newHtmlToEbayEn);
      setHtmlToEbayFr(newHtmlToEbayFr);
      setHtmlToEbayIt(newHtmlToEbayIt);
      setHtmlToShopify(newHtmlToShopify);
      setHtmlToEmagRo(newHtmlToEmagRo);

      const splitDE = await callSplitHtmlFromBackend(newHtmlToEbayDe);
      if (splitDE) dispatch(updateProduct({ ebayDE: splitDE }));

      const splitEN = await callSplitHtmlFromBackend(newHtmlToEbayEn);
      if (splitEN) dispatch(updateProduct({ ebayEN: splitEN }));

      const splitFR = await callSplitHtmlFromBackend(newHtmlToEbayFr);
      if (splitFR) dispatch(updateProduct({ ebayFR: splitFR }));

      const splitIT = await callSplitHtmlFromBackend(newHtmlToEbayIt);
      if (splitIT) dispatch(updateProduct({ ebayIT: splitIT }));
    } else {
      toast.warn(
        "Kody dla eBay nie zostały wygenerowane - najpierw przetłumacz produkt lub pomiń tłumaczenie."
      );
    }

    setIsCodeGenerated(true);
    console.log(productData.ingredients.fr);
    toast.success("Kod został poprawnie wygenerowany");
  };

  // COSMETICS GENERATOR FUNCTION

  const generateCodeCosmetics = async () => {
    if (!checkMandatoryFields()) {
      toast.error(
        `Uzupełnij obowiązkowe pola: ${missingMandatoryFields.join(", ")}`
      );
      return;
    }

    const newHtmlToShop = generateCosmeticsShopHtml(productData);
    const newHtmlToBl = replaceStrongWithB(generateCosmeticsBlHtml(productData));

    setHtmlToShop(replaceH2WithH3(newHtmlToShop));
    setHtmlToBl(replaceH3WithH2(newHtmlToBl));

    if (isTranslated) {
      const newHtmlToEbayDe = generateEbayDeHtmlCosmetics(productData);
      const newHtmlToEbayEn = generateEbayEnHtmlCosmetics(productData);
      const newHtmlToEbayFr = generateEbayFrHtmlCosmetics(productData);
      const newHtmlToEbayIt = generateEbayItHtmlCosmetics(productData);
      const newHtmlToShopify = generateShopifyCosmetics(productData);
      const newHtmlToEmagRo = generateEmagRoCosmetics(productData);

      setHtmlToEbayDe(newHtmlToEbayDe);
      setHtmlToEbayEn(newHtmlToEbayEn);
      setHtmlToEbayFr(newHtmlToEbayFr);
      setHtmlToEbayIt(newHtmlToEbayIt);
      setHtmlToShopify(newHtmlToShopify);
      setHtmlToEmagRo(newHtmlToEmagRo);

      const splitDE = await callSplitHtmlFromBackend(newHtmlToEbayDe);
      if (splitDE) dispatch(updateProduct({ ebayDE: splitDE }));

      const splitEN = await callSplitHtmlFromBackend(newHtmlToEbayEn);
      if (splitEN) dispatch(updateProduct({ ebayEN: splitEN }));

      const splitFR = await callSplitHtmlFromBackend(newHtmlToEbayFr);
      if (splitFR) dispatch(updateProduct({ ebayFR: splitFR }));

      const splitIT = await callSplitHtmlFromBackend(newHtmlToEbayIt);
      if (splitIT) dispatch(updateProduct({ ebayIT: splitIT }));
    } else {
      toast.warn(
        "Kody dla eBay nie zostały wygenerowane - najpierw przetłumacz produkt lub pomiń tłumaczenie."
      );
    }

    setIsCodeGenerated(true);
    toast.success("Kod został poprawnie wygenerowany");
  };

  return (
    <div className={style.generator}>
      <header className={style.generator__header}>
        <h2>Medpak Code Generator 2.5!!</h2>
        <div className={style["generator__header-btns"]}>
          <Button onClick={() => setType("supplements")}>
            Suplementy diety
          </Button>
          <Button onClick={() => setType("cosmetics")}>Kosmetyki/inne</Button>
        </div>
        {/* new feature testing */}
        {/* <div className={style["generator__header-btns2"]}>
          <Button onClick={() => setType2("add")}>
            Dodawanie nowego produktu
          </Button>
          <Button onClick={() => setType2("update")}>
            Aktualizacja istniejącego produktu
          </Button>
        </div> */}
      </header>
      <div className={style.generator__content}>
        {/* // new feature testing */}
        {/* {type === "supplements" && (
          <>
            {type2 === "update" && <ProductUpdateSection />}
            <div>
              <SupplementsForm resetKey={resetKey} />
            </div>
          </>
        )}

        {type === "cosmetics" && (
          <div className={style.generator__cosmetics}>
            <>
              {type2 === "update" && <ProductUpdateSection />}

              <CosmeticsForm resetKey={resetKey} />
            </>
          </div>
        )} */}

        {type === "supplements" && (
          <div>
            <ProductUpdateSection />
            <SupplementsForm resetKey={resetKey} />
          </div>
        )}

        {type === "cosmetics" && (
          <div className={style.generator__cosmetics}>
            <ProductUpdateSection />
            <CosmeticsForm resetKey={resetKey} />
          </div>
        )}
        {((type === "cosmetics" || type === "supplements") && operationType === null) && (
          <div className={style["generator__header-btns"]}>
            <Button onClick={() => setOperationType("Nowy produkt")}>
              Dodawanie nowego produktu
            </Button>
            <Button onClick={() => setOperationType("Aktualizacja")}>
              Aktualizacja istniejącego produktu
            </Button>
          </div>
        )}


        {((type === "cosmetics" || type === "supplements") && operationType !== null)
          && (
            <>
              <GeneratorBtns
                productType={type}
                generateCode={generateCode}
                generateCodeCosmetics={generateCodeCosmetics}
                sendToGoogleSheets={sendToGoogleSheets}
                sendToGoogleSheetsOnlyEbay={sendToGoogleSheetsOnlyEbay}
                resetForm={resetForm}
                copyHtmlToShop={copyHtmlToShop}
                copyShortDescToShop={copyShortDescToShop}
                handleTranslate={handleTranslate}
                copyHtmlToBl={copyHtmlToBl}
                copyHtmlToEbayDe={copyHtmlToEbayDe}
                copyHtmlToEbayEn={copyHtmlToEbayEn}
                copyHtmlToEbayFr={copyHtmlToEbayFr}
                copyHtmlToEbayIt={copyHtmlToEbayIt}
                copyHtmlToEmagRo={copyHtmlToEmagRo}
                copyHtmlToShopAndShortDesc={copyHtmlToShopAndShortDesc}
                htmlToShop={htmlToShop}
                htmlToBl={htmlToBl}
                htmlToEbayDe={htmlToEbayDe}
                htmlToEbayEn={htmlToEbayEn}
                htmlToEbayFr={htmlToEbayFr}
                htmlToEbayIt={htmlToEbayIt}
                style={style}
                isTranslating={isTranslating}
                isTranslated={isTranslated}
                skipTranslation={skipTranslation}
                translateSkipped={translateSkipped}
                isCodeGenerated={isCodeGenerated}
                isSendingToSheets={isSendingToSheets}
                isDataSentToSheets={isDataSentToSheets}
                translationError={translationError}
              />
            </>
          )}
      </div>
    </div>
  );
};

export default ProductCodeGenerator;
