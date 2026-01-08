import { toast } from "react-toastify";
import { exceptions } from "./translationExceptions";
import { manualTranslationOverrides } from "./manualTranslationOverrides";

// Funkcja do ekstrakcji tagów HTML i tekstu
export const extractHtmlTagsAndContent = (htmlText) => {
  const elements = [];

  // Zmieniony regex: dopasowuje również białe znaki wokół znaczników
  const regex = /(<[^>]+>)|([^<>]+)/g;
  let match;

  while ((match = regex.exec(htmlText)) !== null) {
    if (match[1]) {
      elements.push({ type: "tag", content: match[1] });
    } else if (match[2]) {
      // Nie usuwaj spacji — zostaw tak jak są
      elements.push({ type: "text", content: match[2] });
    }
  }

  return elements;
};

// Funkcja tłumacząca tekst z obsługą wyjątków
export const translateWithExceptions = async (text, lang) => {
  if (!text || text.trim() === "") {
    return "";
  }

  // Lista wyjątków znalezionych w tekście (z zachowaniem oryginalnej wielkości liter)
  const foundExceptions = [];
  exceptions.forEach((exception) => {
    const regex = new RegExp(exception, "gi");
    let match;
    while ((match = regex.exec(text)) !== null) {
      foundExceptions.push({
        original: match[0],
        index: match.index,
        length: match[0].length,
      });
    }
  });

  if (foundExceptions.length === 0) {
    // Jeśli nie ma wyjątków, po prostu przetłumacz tekst
    return await translateText(text, lang);
  }

  // Zastąp wyjątki unikalnymi tokenami, które z dużym prawdopodobieństwem nie zostaną przetłumaczone
  let modifiedText = text;
  const tokens = [];

  foundExceptions.forEach((exception, i) => {
    // Tworzymy unikalny token, który nie będzie tłumaczony
    const token = `@@NOTR4NSL4T3_${i}_${Math.random()
      .toString(36)
      .substring(2, 8)}@@`;
    tokens.push({
      token,
      original: exception.original,
    });

    // Zastępujemy znaleziony wyjątek tokenem
    modifiedText =
      modifiedText.substring(0, exception.index) +
      token +
      modifiedText.substring(exception.index + exception.length);
  });

  try {
    // Tłumaczymy tekst z tokenami
    let translatedText = await translateText(modifiedText, lang);

    // Przywracamy oryginalne wartości wyjątków
    tokens.forEach(({ token, original }) => {
      translatedText = translatedText.replace(token, original);
    });

    return translatedText;
  } catch (error) {
    toast.error(`${error.message} Proszę spróbować ponownie.`);
    throw new Error(`Nieudane tłumaczenie: ${error.message}`);
  }
};

// Funkcja do tłumaczenia tekstu z zachowaniem HTML
export const translateTextWithHtml = async (htmlText, lang) => {
  // Jeśli tekst jest pusty, zwróć pusty string
  if (!htmlText || htmlText.trim() === "") {
    return "";
  }

  // Sprawdź, czy tekst zawiera znaczniki HTML
  if (!htmlText.includes("<") || !htmlText.includes(">")) {
    // Jeśli nie zawiera znaczników HTML, użyj zwykłego tłumaczenia
    return await translateWithExceptions(htmlText, lang);
  }

  // Wyodrębnij elementy HTML i tekst
  const elements = extractHtmlTagsAndContent(htmlText);

  // Przetwórz każdy fragment tekstu
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].type === "text" && elements[i].content.trim() !== "") {
      // Przetłumacz zawartość tekstową z obsługą wyjątków
      elements[i].content = await translateWithExceptions(
        elements[i].content,
        lang
      );
    }
  }

  // Złóż tekst z powrotem
  let output = "";
  for (let i = 0; i < elements.length; i++) {
    const current = elements[i];
    const prev = elements[i - 1];

    if (
      current.type === "tag" &&
      prev?.type === "text" &&
      !prev.content.match(/\s$/)
    ) {
      output += " ";
    }

    output += current.content;
  }

  return output;
};

// Funkcja do tłumaczenia wszystkich pól
export const translateAllFields = async (
  productData,
  initialState,
  setIsTranslating // Dodajemy parametr funkcji do aktualizacji stanu ładowania
) => {
  const fieldsToTranslate = [
    "productName",
    "description",
    "shortDescription",
    "ingredients",
    "howToUse",
    "bulletpoints",
    "contraindications",
    "storage",
    "additionalInformation",
    "cosmeticsDescription1",
    "cosmeticsDescription2",
    "cosmeticsDescription3",
    "cosmeticsDescription4",
    "tableEnd",
    "producer",
    "responsibleEntity",
  ];

  // Pola, które mogą zawierać HTML i powinny być tłumaczone specjalną funkcją
  const htmlFields = [
    "description",
    "shortDescription",
    "howToUse",
    "bulletpoints",
    "contraindications",
    "storage",
    "additionalInformation",
    "cosmeticsDescription1",
    "cosmeticsDescription2",
    "cosmeticsDescription3",
    "cosmeticsDescription4",
  ];

  const translatedData = {};

  try {
    for (const field of fieldsToTranslate) {
      const original = productData[field]?.pl;
      const originalDefault = initialState.product[field]?.pl;

      if (original) {
        // jeśli wartość jest identyczna jak w initialState, użyj gotowych tłumaczeń
        if (original === originalDefault) {
          translatedData[field] = {
            ...productData[field],
            en: initialState.product[field]?.en || "",
            de: initialState.product[field]?.de || "",
            fr: initialState.product[field]?.fr || "",
            it: initialState.product[field]?.it || "",
            ro: initialState.product[field]?.ro || "", // DODANE: język rumuński
          };
        } else {
          // Sprawdź, czy pole może zawierać HTML
          const isHtmlField = htmlFields.includes(field);
          const translateFunc = isHtmlField
            ? translateTextWithHtml
            : translateWithExceptions;

          // Użyj Promise.all, ale obsłuż błędy dla każdego tłumaczenia
          const translations = await Promise.all([
            translateFunc(original, "en-GB").catch((error) => {
              toast.error(`Błąd tłumaczenia na angielski: ${error.message}`);
              throw error;
            }),
            translateFunc(original, "de").catch((error) => {
              toast.error(`Błąd tłumaczenia na niemiecki: ${error.message}`);
              throw error;
            }),
            translateFunc(original, "fr").catch((error) => {
              toast.error(`Błąd tłumaczenia na francuski: ${error.message}`);
              throw error;
            }),
            translateFunc(original, "it").catch((error) => {
              toast.error(`Błąd tłumaczenia na włoski: ${error.message}`);
              throw error;
            }),
            translateFunc(original, "ro").catch((error) => { // DODANE: język rumuński
              toast.error(`Błąd tłumaczenia na rumuński: ${error.message}`);
              throw error;
            }),
          ]);

          const [en, de, fr, it, ro] = translations; // DODANE: ro w destrukturyzacji

          translatedData[field] = {
            ...productData[field],
            en,
            de,
            fr,
            it,
            ro, // DODANE: język rumuński
          };
        }
      }
    }

    const sizeUnitPl = productData.size.unit.pl;
    const initialSizeUnitPl = initialState.product.size.unit.pl;

    // Tłumaczenie ingredientsTable
    const translatedIngredients = await Promise.all(
      productData.ingredientsTable.map(async (ingredient) => {
        try {
          const translatedIngredient = {
            ...ingredient,
            ingredient: {
              ...ingredient.ingredient,
              en: ingredient.ingredient.pl
                ? await translateWithExceptions(
                    ingredient.ingredient.pl,
                    "en-GB"
                  )
                : "",
              de: ingredient.ingredient.pl
                ? await translateWithExceptions(ingredient.ingredient.pl, "de")
                : "",
              fr: ingredient.ingredient.pl
                ? await translateWithExceptions(ingredient.ingredient.pl, "fr")
                : "",
              it: ingredient.ingredient.pl
                ? await translateWithExceptions(ingredient.ingredient.pl, "it")
                : "",
              ro: ingredient.ingredient.pl // DODANE: język rumuński
                ? await translateWithExceptions(ingredient.ingredient.pl, "ro")
                : "",
            },
            ingredientValue: {
              ...ingredient.ingredientValue,
              en: ingredient.ingredientValue.pl
                ? await translateWithExceptions(
                    ingredient.ingredientValue.pl,
                    "en-GB"
                  )
                : "",
              de: ingredient.ingredientValue.pl
                ? await translateWithExceptions(
                    ingredient.ingredientValue.pl,
                    "de"
                  )
                : "",
              fr: ingredient.ingredientValue.pl
                ? await translateWithExceptions(
                    ingredient.ingredientValue.pl,
                    "fr"
                  )
                : "",
              it: ingredient.ingredientValue.pl
                ? await translateWithExceptions(
                    ingredient.ingredientValue.pl,
                    "it"
                  )
                : "",
              ro: ingredient.ingredientValue.pl // DODANE: język rumuński
                ? await translateWithExceptions(
                    ingredient.ingredientValue.pl,
                    "ro"
                  )
                : "",
            },
            additionalLines: await Promise.all(
              (ingredient.additionalLines || []).map(async (line) => ({
                ...line,
                ingredient: {
                  ...line.ingredient,
                  en: line.ingredient.pl
                    ? await translateWithExceptions(line.ingredient.pl, "en-GB")
                    : "",
                  de: line.ingredient.pl
                    ? await translateWithExceptions(line.ingredient.pl, "de")
                    : "",
                  fr: line.ingredient.pl
                    ? await translateWithExceptions(line.ingredient.pl, "fr")
                    : "",
                  it: line.ingredient.pl
                    ? await translateWithExceptions(line.ingredient.pl, "it")
                    : "",
                  ro: line.ingredient.pl // DODANE: język rumuński
                    ? await translateWithExceptions(line.ingredient.pl, "ro")
                    : "",
                },
                ingredientValue: {
                  ...line.ingredientValue,
                  en: line.ingredientValue.pl
                    ? await translateWithExceptions(
                        line.ingredientValue.pl,
                        "en-GB"
                      )
                    : "",
                  de: line.ingredientValue.pl
                    ? await translateWithExceptions(
                        line.ingredientValue.pl,
                        "de"
                      )
                    : "",
                  fr: line.ingredientValue.pl
                    ? await translateWithExceptions(
                        line.ingredientValue.pl,
                        "fr"
                      )
                    : "",
                  it: line.ingredientValue.pl
                    ? await translateWithExceptions(
                        line.ingredientValue.pl,
                        "it"
                      )
                    : "",
                  ro: line.ingredientValue.pl // DODANE: język rumuński
                    ? await translateWithExceptions(
                        line.ingredientValue.pl,
                        "ro"
                      )
                    : "",
                },
              }))
            ),
          };

          return translatedIngredient;
        } catch (error) {
          // Jeśli wystąpi błąd przy tłumaczeniu składnika, przerwij cały proces
          throw new Error(`Błąd przy tłumaczeniu składnika: ${error.message}`);
        }
      })
    );

    translatedData.ingredientsTable = translatedIngredients;

    // Tłumaczenie jednostki rozmiaru
    translatedData.size = {
      ...productData.size,
      unit: {
        pl: sizeUnitPl || "",
        en:
          sizeUnitPl === initialSizeUnitPl
            ? initialState.product.size.unit.en || ""
            : sizeUnitPl
            ? await translateWithExceptions(sizeUnitPl, "en-GB")
            : "",
        de:
          sizeUnitPl === initialSizeUnitPl
            ? initialState.product.size.unit.de || ""
            : sizeUnitPl
            ? await translateWithExceptions(sizeUnitPl, "de")
            : "",
        fr:
          sizeUnitPl === initialSizeUnitPl
            ? initialState.product.size.unit.fr || ""
            : sizeUnitPl
            ? await translateWithExceptions(sizeUnitPl, "fr")
            : "",
        it:
          sizeUnitPl === initialSizeUnitPl
            ? initialState.product.size.unit.it || ""
            : sizeUnitPl
            ? await translateWithExceptions(sizeUnitPl, "it")
            : "",
        ro: // DODANE: język rumuński
          sizeUnitPl === initialSizeUnitPl
            ? initialState.product.size.unit.ro || ""
            : sizeUnitPl
            ? await translateWithExceptions(sizeUnitPl, "ro")
            : "",
      },
    };

    const portionUnitPl = productData.portion.unit.pl;
    const initialPortionUnitPl = initialState.product.portion.unit.pl;

    // Tłumaczenie jednostki porcji
    translatedData.portion = {
      ...productData.portion,
      unit: {
        pl: portionUnitPl || "",
        en:
          portionUnitPl === initialPortionUnitPl
            ? initialState.product.portion.unit.en || ""
            : portionUnitPl
            ? await translateWithExceptions(portionUnitPl, "en-GB")
            : "",
        de:
          portionUnitPl === initialPortionUnitPl
            ? initialState.product.portion.unit.de || ""
            : portionUnitPl
            ? await translateWithExceptions(portionUnitPl, "de")
            : "",
        fr:
          portionUnitPl === initialPortionUnitPl
            ? initialState.product.portion.unit.fr || ""
            : portionUnitPl
            ? await translateWithExceptions(portionUnitPl, "fr")
            : "",
        it:
          portionUnitPl === initialPortionUnitPl
            ? initialState.product.portion.unit.it || ""
            : portionUnitPl
            ? await translateWithExceptions(portionUnitPl, "it")
            : "",
        ro: // DODANE: język rumuński
          portionUnitPl === initialPortionUnitPl
            ? initialState.product.portion.unit.ro || ""
            : portionUnitPl
            ? await translateWithExceptions(portionUnitPl, "ro")
            : "",
      },
    };

    return translatedData;
  } catch (error) {
    // W przypadku jakiegokolwiek błędu podczas tłumaczenia
    toast.error(`Proces tłumaczenia został przerwany: ${error.message}`);

    // Zmień stan ładowania na false, jeśli został przekazany
    if (setIsTranslating) {
      setIsTranslating(false);
    }

    // Rzuć błąd dalej, aby komponent mógł go obsłużyć
    throw error;
  }
};

export const translateText = async (text, targetLang) => {
  const API_URL = import.meta.env.VITE_API_URL;
  if (!API_URL) {
    throw new Error("Brak VITE_API_URL. Ustaw w frontend/.env i na Vercel.");
  }

  try {
    const response = await fetch(`${API_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // backend może zwrócić { status, message } (np. 503 gdy brak DEEPL_AUTH_KEY)
      const msg =
        data?.message ||
        `Tłumaczenie na język ${targetLang} nie powiodło się (HTTP ${response.status}).`;
      throw new Error(msg);
    }

    if (!data?.translatedText) {
      throw new Error(`Brak translatedText w odpowiedzi dla języka ${targetLang}.`);
    }

    let translated = data.translatedText;

    // Zastosowanie ręcznych poprawek
    const overrides = manualTranslationOverrides?.[targetLang] || {};
    for (const [plWord, correctTranslation] of Object.entries(overrides)) {
      const regex = new RegExp(`\\b${plWord}\\b`, "gi"); // tylko całe słowa
      translated = translated.replace(regex, correctTranslation);
    }

    return translated;
  } catch (error) {
    throw new Error(`Błąd tłumaczenia na język ${targetLang}: ${error.message || error}`);
  }
};
