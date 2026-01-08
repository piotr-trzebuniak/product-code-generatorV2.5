import { google } from "googleapis";
import { LRUCache } from "lru-cache";





// Twoje stałe:
const DEFAULT_SHEET_NAME = "IMPORT SKLEP";
const DATA_START_ROW = 4; // dane zaczynają się od wiersza 4

function getSpreadsheetId() {
  const id = (process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "").trim();
  if (!id) throw new Error("Missing env: GOOGLE_SHEETS_SPREADSHEET_ID");
  return id;
}


function normalizeSku(sku) {
  return String(sku || "").trim().toUpperCase();
}

function getServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing env: GOOGLE_SERVICE_ACCOUNT_JSON");
  return JSON.parse(raw);
}

async function getSheetsClient() {
  const sa = getServiceAccount();

  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  await auth.authorize();
  return google.sheets({ version: "v4", auth });
}

// cache indeksu SKU -> numer wiersza (1-indexed)
const skuIndexCache = new LRUCache({
  max: 10,
  ttl: 1000 * 60 * 1, // 1 min
});



async function buildSkuIndex(sheets, sheetName) {
  // pobieramy tylko od wiersza 4 w dół, kolumna A
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `'${sheetName}'!A${DATA_START_ROW}:A`,
    majorDimension: "COLUMNS",
  });

  // To jest zakres od A4 w dół, więc col[0] = A4, col[1] = A5, itd.
  const col = resp.data.values?.[0] || [];
  const map = new Map();

  for (let i = 0; i < col.length; i++) {
    const sku = normalizeSku(col[i]);
    if (!sku) continue;

    const rowNumber = DATA_START_ROW + i; // bo i=0 to wiersz 4
    if (!map.has(sku)) map.set(sku, rowNumber);
  }

  return map;
}

export async function getRowDefBySku({ sku, sheetName = DEFAULT_SHEET_NAME }) {
  const SPREADSHEET_ID = getSpreadsheetId();

  const normalized = normalizeSku(sku);
  if (!normalized) return { found: false, reason: "empty_sku" };

  const sheets = await getSheetsClient();


  const cacheKey = `${SPREADSHEET_ID}:${sheetName}:skuIndex:${DATA_START_ROW}`;
  let index = skuIndexCache.get(cacheKey);

  if (!index) {
    index = await buildSkuIndex(sheets, sheetName);
    skuIndexCache.set(cacheKey, index);
  }

  const row = index.get(normalized);
  if (!row) return { found: false, reason: "not_found", sku: normalized };

  // D,E,F z konkretnego wiersza (nazwa arkusza w apostrofach, bo ma spację)
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!D${row}:F${row}`,
  });

  const [D = "", E = "", F = ""] = resp.data.values?.[0] || [];

  return { found: true, sku: normalized, row, D, E, F };
}
