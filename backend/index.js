// BACKEND (Render + Localhost)

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import * as deepl from "deepl-node";
import { splitHtml } from "./splitHtml.js";
import { getRowDefBySku } from "./googleSheets.js";

// zawsze znajdź .env w katalogu głównym projektu (poza /backend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
const port = process.env.PORT || 3000;

// CORS z ENV: "https://xxx.vercel.app,http://localhost:5173"
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Konfiguracja CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Zezwalaj na żądania bez origin (Postman / server-to-server)
      if (!origin) return callback(null, true);

      // jeśli nie ustawisz CORS_ORIGINS, nie blokuj niczego (fallback)
      if (allowedOrigins.length === 0) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight
app.options("*", cors());

app.use(bodyParser.json());

// Health check (Render)
app.get("/health", (req, res) => res.status(200).send("ok"));

// DeepL
const authKey = (process.env.DEEPL_AUTH_KEY || "").trim();
const translator = authKey ? new deepl.Translator(authKey) : null;

if (!translator) {
  console.warn("DEEPL_AUTH_KEY is missing – /translate will be disabled.");
}

// Endpoint do tłumaczenia DeepL
app.post("/translate", async (req, res) => {
  try {
    if (!translator) {
      return res.status(503).json({
        status: "error",
        message: "Brak konfiguracji DEEPL_AUTH_KEY na backendzie",
      });
    }

    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({
        status: "error",
        message: "Brak tekstu lub języka docelowego",
      });
    }

    const result = await translator.translateText(text, null, targetLang);
    return res.json({ translatedText: result.text });
  } catch (error) {
    console.error("DeepL Translation Error:", error);
    return res.status(500).json({ status: "error", message: "Błąd tłumaczenia" });
  }
});

// Endpoint: wysyłka do Apps Script (Baselinker/eBay/Shopify itd.)
app.post("/submit", async (req, res) => {
  try {
    const data = req.body;
    const { target } = data;

    console.log("Received data for:", target);

    let scriptUrl;

    switch (target) {
      case "baselinker":
        scriptUrl =
          "https://script.google.com/macros/s/AKfycbwjUP2ECcn5Jjo5yjIwWUEvz0Ivj9alyy8QUr4RjDko1sRKIOroYS4WSxwP9Z7MOlIqyg/exec";
        break;
      case "ebay-de":
        scriptUrl =
          "https://script.google.com/macros/s/AKfycbwqtPGlg_JS5aJMtCNU5GwTIfbJb1iGRpOKug9a_dornWF7UYq_p9PGbRFUiueEy1qX/exec";
        break;
      case "ebay-en":
        scriptUrl =
          "https://script.google.com/macros/s/AKfycbyP9JDUeFwK8AstDoAasbU5TQDYS2cieCgvi-jcqq8SX7tXZ6wY-uGge6z4TgNBCTG0/exec";
        break;
      case "ebay-fr":
        scriptUrl =
          "https://script.google.com/macros/s/AKfycbwgi3rObniTrFYMJstMVxI7GNaO8WBpP4k6kwIfcMwkzN7kJd48AR5agWfnsh7ySt_k/exec";
        break;
      case "ebay-it":
        scriptUrl =
          "https://script.google.com/macros/s/AKfycbzEmYeElN5MeV_BBvtGPglbbOkN88-g1Q7NqX0AtRbJ7tybOT_vYIgkE0rDm8ZiZN-h0Q/exec";
        break;
      case "shopify":
        scriptUrl =
          "https://script.google.com/macros/s/AKfycbwZBbl3969vybkvOyqZ3lU1SdIu2VdnmQMN_JQ_rrnSvTruPtJtFS-rFbRV4jmhhDOpRA/exec";
        break;
      case "emag-ro":
        scriptUrl =
          "https://script.google.com/macros/s/AKfycbw3oXl_0Ndlx-kitYbxKaVxuTzvVrB3FDEQzpkfzAsBZBNvwfVBBj-OOVTYTnvhJBnawg/exec";
        break;
      default:
        return res
          .status(400)
          .json({ status: "error", message: "Nieznany typ celu (target)" });
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return res.json(result);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ status: "error", message: "Coś poszło nie tak" });
  }
});

// SPLIT HTML
app.post("/split-html", (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: "Brak danych HTML" });
    }

    const result = splitHtml(html);
    return res.json(result);
  } catch (error) {
    console.error("Błąd splitHtml:", error);
    return res.status(500).json({ error: "Wewnętrzny błąd serwera" });
  }
});

// GOOGLE SHEETS: pobranie danych po SKU (kolumny D,E,F)
app.get("/gsheet/by-sku", async (req, res) => {
  try {
    const sku = req.query.sku;

    console.time(`gsheet_by_sku_${sku || "empty"}`);

    const result = await getRowDefBySku({
      sku,
      sheetName: req.query.sheet || "IMPORT SKLEP",
    });

    console.timeEnd(`gsheet_by_sku_${sku || "empty"}`);

    if (!result.found) return res.status(404).json(result);

    return res.json(result);
  } catch (e) {
    console.error("gsheet/by-sku error:", e);
    return res.status(500).json({
      status: "error",
      message: e?.message || String(e),
    });
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});

// Warmup cache (nie blokuje startu)
(async () => {
  try {
    await getRowDefBySku({ sku: "__WARMUP__" });
    console.log("Google Sheets cache warmed up");
  } catch (e) {
    console.warn("Warmup skipped:", e.message);
  }
})();


// BACKEND RENDER.COM

// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import fetch from "node-fetch";
// import path from "path";
// import * as deepl from "deepl-node";
// import { splitHtml } from "./splitHtml.js";

// const authKey = process.env.DEEPL_AUTH_KEY;
// const translator = new deepl.Translator(authKey);
// const __dirname = path.resolve();
// const app = express();
// const port = process.env.PORT || 3000;

// // Skonfigurowany CORS, aby zezwalać na żądania z frontendu na Vercel
// app.use(
//   cors({
//     origin: [
//       "https://product-code-generator-v2-frontend.vercel.app",
//       "http://localhost:5173",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Obsługa preflight requests
// app.options("*", cors());

// app.use(bodyParser.json()); // Pozwala na odbieranie JSON w ciele żądania

// // Dodatkowe middleware dla nagłówków CORS
// app.use((req, res, next) => {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://product-code-generator-v2-frontend.vercel.app"
//   );
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

// app.use(express.static(path.join(__dirname, "/frontend/dist")));

// // Specyficzna obsługa OPTIONS dla endpointu submit
// app.options("/submit", cors());

// // Endpoint do przesyłania danych do tłumaczenia DeepL
// app.post("/translate", async (req, res) => {
//   try {
//     const { text, targetLang } = req.body;

//     if (!text || !targetLang) {
//       return res.status(400).json({
//         status: "error",
//         message: "Brak tekstu lub języka docelowego",
//       });
//     }

//     const result = await translator.translateText(text, null, targetLang);

//     res.json({ translatedText: result.text });
//   } catch (error) {
//     console.error("DeepL Translation Error:", error);
//     res.status(500).json({ status: "error", message: "Błąd tłumaczenia" });
//   }
// });

// app.post("/submit", async (req, res) => {
//   try {
//     const data = req.body;
//     const { target } = data;

//     console.log("Received data for:", target);

//     let scriptUrl;

//     switch (target) {
//       case "baselinker":
//         scriptUrl =
//           "https://script.google.com/macros/s/AKfycbwjUP2ECcn5Jjo5yjIwWUEvz0Ivj9alyy8QUr4RjDko1sRKIOroYS4WSxwP9Z7MOlIqyg/exec";
//         break;
//       case "ebay-de":
//         scriptUrl =
//           "https://script.google.com/macros/s/AKfycbwqtPGlg_JS5aJMtCNU5GwTIfbJb1iGRpOKug9a_dornWF7UYq_p9PGbRFUiueEy1qX/exec";
//         break;
//       case "ebay-en":
//         scriptUrl =
//           "https://script.google.com/macros/s/AKfycbyP9JDUeFwK8AstDoAasbU5TQDYS2cieCgvi-jcqq8SX7tXZ6wY-uGge6z4TgNBCTG0/exec";
//         break;
//       case "ebay-fr":
//         scriptUrl =
//           "https://script.google.com/macros/s/AKfycbwgi3rObniTrFYMJstMVxI7GNaO8WBpP4k6kwIfcMwkzN7kJd48AR5agWfnsh7ySt_k/exec";
//         break;
//       case "ebay-it":
//         scriptUrl =
//           "https://script.google.com/macros/s/AKfycbzEmYeElN5MeV_BBvtGPglbbOkN88-g1Q7NqX0AtRbJ7tybOT_vYIgkE0rDm8ZiZN-h0Q/exec";
//         break;
//       case "shopify":
//         scriptUrl =
//           "https://script.google.com/macros/s/AKfycbwZBbl3969vybkvOyqZ3lU1SdIu2VdnmQMN_JQ_rrnSvTruPtJtFS-rFbRV4jmhhDOpRA/exec";
//         break;
//       case "emag-ro":
//         scriptUrl =
//           "https://script.google.com/macros/s/AKfycbysHsZViuyC7W0BpNUjHG9PfOPfKDvEtEg9uW2W4YvfRUTU_-BH4GTNRRGhqzrcOXQC8w/exec";
//         break;
//       default:
//         return res
//           .status(400)
//           .json({ status: "error", message: "Nieznany typ celu (target)" });
//     }

//     const response = await fetch(scriptUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     const result = await response.json();
//     res.json(result);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ status: "error", message: "Coś poszło nie tak" });
//   }
// });

// // SPLIT HTML START

// app.post("/split-html", (req, res) => {
//   try {
//     const { html } = req.body;

//     if (!html) {
//       return res.status(400).json({ error: "Brak danych HTML" });
//     }

//     const result = splitHtml(html);
//     res.json(result);
//   } catch (error) {
//     console.error("Błąd splitHtml:", error);
//     res.status(500).json({ error: "Wewnętrzny błąd serwera" });
//   }
// });

// // SPLIT HTML FINISH

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
// });

// // Uruchomienie serwera
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}!`);
// });




