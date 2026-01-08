import axios from "axios";

const API_KEY = "120ba9d9-acdb-4220-8adf-617e26d6b6f7:fx"; // Wstaw swój klucz API

export const translateText = async (text, targetLang) => {
  try {
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      new URLSearchParams({
        auth_key: API_KEY,
        text: text,
        target_lang: targetLang,
        preserve_formatting: "1", // Zachowanie formatowania HTML
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data.translations[0].text;
  } catch (error) {
    console.error("Błąd tłumaczenia:", error);
    return text; // Zwróć oryginalny tekst w razie błędu
  }
};
