import React from "react";
import Button from "../../../compoments/Button/Button";

const GeneratorBtns = ({
  productType,
  generateCode,
  generateCodeCosmetics,
  sendToGoogleSheets,
  sendToGoogleSheetsOnlyEbay,
  resetForm,
  copyHtmlToShop,
  copyShortDescToShop,
  copyHtmlToShopAndShortDesc,
  copyHtmlToBl,
  copyHtmlToEbayDe,
  copyHtmlToEbayEn,
  copyHtmlToEbayFr,
  copyHtmlToEbayIt,
  copyHtmlToEmagRo,
  htmlToShop,
  htmlToBl,
  style,
  handleTranslate,
  skipTranslation,
  translateSkipped,
  isTranslating,
  isTranslated,
  isCodeGenerated,
  isSendingToSheets,
  isDataSentToSheets,
  translationError, // Nowa właściwość do obsługi błędów tłumaczenia
}) => {
  return (
    <div className={style.generator__btns}>
      {/* Krok 1: Przyciski tłumaczenia */}
      <div className={style.generator__translationBtn}>
        {/* {!isTranslated && !isTranslating && (
          <>
            <Button
              onClick={handleTranslate}
              disabled={isTranslating}
              className={style.generator__translateBtn}
            >
              {isTranslating ? "Tłumaczenie w toku..." : "Przetłumacz"}
            </Button>
            <Button
              onClick={skipTranslation}
              disabled={isTranslating}
              className={style.generator__skipTranslateBtn}
            >
              Pomiń tłumaczenie
            </Button>
          </>
        )} */}
        {!isTranslating && (
          <>
            <Button
              onClick={handleTranslate}
              disabled={isTranslating}
              className={style.generator__translateBtn}
            >
              {isTranslating ? "Tłumaczenie w toku..." : "Przetłumacz"}
            </Button>
            <Button
              onClick={skipTranslation}
              disabled={isTranslating}
              className={style.generator__skipTranslateBtn}
            >
              Pomiń tłumaczenie
            </Button>
          </>
        )}
      </div>

      {/* Wskaźnik błędu tłumaczenia (nowy element) */}
      {translationError && !isTranslating && !isTranslated && (
        <div className={style.generator__translationError || ""}>
          <span>Wystąpił błąd podczas tłumaczenia: {translationError}</span>
          <Button
            onClick={handleTranslate}
            className={style.generator__retryBtn || ""}
          >
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {/* Wskaźniki stanu tłumaczenia - pokazuj tylko w trakcie tłumaczenia */}
      {isTranslating && !isTranslated && (
        <div className={style.generator__translationStatus}>
          <div className={style.generator__translationItem}>
            <span>Dane są tłumaczone...</span>
            <div className={style.generator__loadingIcon}>
              {/* Ikona ładowania */}
              <div className={style.generator__spinner}></div>
            </div>
          </div>
        </div>
      )}

      {/* Pokazuj informację o sukcesie tylko po zakończonym tłumaczeniu */}
      {isTranslated && !isTranslating && (
        <div className={style.generator__translationStatus}>
          <div className={style.generator__translationItem}>
            <span>Dane zostały poprawnie przetłumaczone!!! ✅</span>
            <div className={style.generator__successIcon}>
              {/* Ikona zielonej "okejki" */}
              <div className={style.generator__checkmark}></div>
            </div>
          </div>
        </div>
      )}

      {/* Informacja o pominięciu tłumaczenia */}
      {translateSkipped && !isTranslated && !isTranslating && (
        <div className={style.generator__translationStatus}>
          <div className={style.generator__translationItem}>
            <span>Tłumaczenie zostało pominięte.</span>
          </div>
        </div>
      )}

      {/* Krok 2: Przycisk generowania kodu (pojawia się po tłumaczeniu lub pominięciu tłumaczenia) */}
      {(isTranslated || translateSkipped) && !isTranslating && (
        <Button
          onClick={
            productType === "cosmetics" ? generateCodeCosmetics : generateCode
          }
          className={style.generator__generateBtn}
        >
          Generuj kod
        </Button>
      )}

      {/* Informacja o wygenerowaniu kodu */}
      {isCodeGenerated && (
        <div className={style.generator__codeGeneratedInfo}>
          <span>Kod został poprawnie wygenerowany!!! ✅</span>
          <div className={style.generator__successIcon}>
            {/* Ikona zielonej "okejki" */}
            <div className={style.generator__checkmark}></div>
          </div>
        </div>
      )}

      {/* Krok 3: Przyciski do kopiowania kodu (pojawiają się po generacji) */}
      {isCodeGenerated && htmlToShop && htmlToBl && (
        <div className={style.generator__copyBtns}>
          <Button onClick={copyHtmlToShop} className={style.generator__copyBtn}>
            Kod HTML dla sklepu
          </Button>
          <Button
            onClick={copyShortDescToShop}
            className={style.generator__copyBtn}
          >
            Kod HTML krótkiego opisu dla sklepu
          </Button>
          <Button
            onClick={copyHtmlToShopAndShortDesc}
            className={style.generator__copyBtn}
          >
            Kod HTML krótkiego opisu dla sklepu + Kod HTML dla sklepu
          </Button>
          <Button onClick={copyHtmlToBl} className={style.generator__copyBtn}>
            Kod HTML dla BaseLinkera
          </Button>
          {/* Przyciski dla eBay - widoczne tylko po przetłumaczeniu LUB pominięciu tłumaczenia */}
          {(isTranslated || translateSkipped) && (
            <>
              <Button
                onClick={copyHtmlToEbayDe}
                className={style.generator__copyBtn}
              >
                Kod HTML dla EBAY DE
              </Button>
              <Button
                onClick={copyHtmlToEbayEn}
                className={style.generator__copyBtn}
              >
                Kod HTML dla EBAY EN
              </Button>
              <Button
                onClick={copyHtmlToEbayFr}
                className={style.generator__copyBtn}
              >
                Kod HTML dla EBAY FR
              </Button>
              <Button
                onClick={copyHtmlToEbayIt}
                className={style.generator__copyBtn}
              >
                Kod HTML dla EBAY IT
              </Button>
              <Button
                onClick={copyHtmlToEmagRo}
                className={style.generator__copyBtn}
              >
                Kod HTML dla EMAG RO
              </Button>
            </>
          )}
        </div>
      )}

      {/* Krok 4: Przycisk dodawania do arkusza (pojawia się po generacji) */}
      {/* {isCodeGenerated &&
        !isSendingToSheets &&
        !isDataSentToSheets &&
        !translateSkipped && (
          <div className={style.generator__sheetBtns}>
            <Button
              onClick={sendToGoogleSheets}
              className={style.generator__sheetBtn}
            >
              Dodaj kod do arkusza
            </Button>
          </div>
        )} */}
        
      {isCodeGenerated && !isSendingToSheets && !translateSkipped && (
        <div className={style.generator__sheetBtns}>
          <Button
            onClick={sendToGoogleSheets}
            className={style.generator__sheetBtn}
          >
            Dodaj kod do arkusza
          </Button>
        </div>
      )}
      {/* ONLY EBAY */}
      {isCodeGenerated && !isSendingToSheets && !translateSkipped && (
        <div className={style.generator__sheetBtns}>
          <Button
            onClick={sendToGoogleSheetsOnlyEbay}
            className={style.generator__sheetBtn}
          >
            Dodaj TYLKO KOD EBAY do arkusza
          </Button>
        </div>
      )}

      {/* Status wysyłania do arkusza */}
      {isSendingToSheets && (
        <div className={style.generator__sheetStatus}>
          <span>Dane są wysyłane do arkusza...</span>
          <div className={style.generator__loadingIcon}>
            {/* Ikona ładowania */}
            <div className={style.generator__spinner}></div>
          </div>
        </div>
      )}

      {isDataSentToSheets && (
        <div className={style.generator__sheetStatus}>
          <span>Dane zostały poprawnie wysłane do arkusza!!! ✅</span>
          <div className={style.generator__successIcon}>
            {/* Ikona zielonej "okejki" */}
            <div className={style.generator__checkmark}></div>
          </div>
        </div>
      )}

      {/* Przycisk resetowania - dostępny zawsze, ale podświetlony po zakończeniu procesu */}
      <div
        className={`${style.generator__resetBtnContainer} ${
          isDataSentToSheets ? style.generator__resetBtnHighlighted : ""
        }`}
      >
        <Button onClick={resetForm} className={style.generator__resetBtn}>
          Resetuj formularz
        </Button>
      </div>
    </div>
  );
};

export default GeneratorBtns;
