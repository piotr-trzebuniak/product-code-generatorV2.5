import { removeTrailingBracketAndDots } from "../../ebay/EN/generateEbayEnHtmlCosmetics";

export const generateIngredientsHTML = (ingredientsTable) => {
  let ingredientsHTML = "";

  ingredientsTable.forEach((ingredient) => {
    // główny składnik
    const name = ingredient.ingredient?.ro || "";
    const value = ingredient.ingredientValue?.ro || "";
    const rws = ingredient.rws === "<>" ? "*" : ingredient.rws || "";

    // sprawdź czy są dodatkowe linie
    if (ingredient.additionalLines && ingredient.additionalLines.length > 0) {
      // składnik z dodatkowymi liniami
      let combinedNames = `<strong>${name} <br></strong>`;
      let combinedValues = `${value}`;

      // dodaj dodatkowe linie
      ingredient.additionalLines.forEach((line, index) => {
        const lineName = line.ingredient?.ro || "";
        const lineValue = line.ingredientValue?.ro || "";

        // dla pierwszej dodatkowej linii nie dodawaj <br> przed nazwą
        if (index === 0) {
          combinedNames += lineName;
        } else {
          combinedNames += `<br>${lineName}`;
        }
        combinedValues += `<br>${lineValue}`;
      });

      ingredientsHTML += `
      <tr>
         <td>
            ${combinedNames}
         </td>
         <td>${combinedValues}</td>
         <td>${rws}</td>
      </tr>`;
    } else {
      // pojedynczy składnik bez dodatkowych linii
      ingredientsHTML += `
      <tr>
         <td><strong>${name}</strong></td>
         <td>${value}</td>
         <td>${rws}</td>
      </tr>`;
    }
  });

  return ingredientsHTML;
};

export const generateEmagRoCosmetics = (productData) => {


  const ingredientsHTML = generateIngredientsHTML(productData.ingredientsTable);


  function transformListHTML(inputHtml) {
    // Wyciągamy nagłówek h3 -> zamiana na h2
    let output = inputHtml.replace(
      /<h3[^>]*>\s*<strong>(.*?)<\/strong>\s*<\/h3>/gi,
      "<h2>$1</h2>"
    );

    // Usuwamy <ul> i </ul>
    output = output.replace(/<\/?ul[^>]*>/gi, "");

    // Zamieniamy każdy <li> na <p>✅ ...</p>
    output = output.replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content) => {
      // zamień <strong> na <b>
      let text = content.replace(/<strong>(.*?)<\/strong>/gi, "<b>$1</b>");

      // jeśli nie ma <b>, pogrub pierwszą część przed myślnikiem
      if (!/^<b>/.test(text)) {
        let parts = text.split(" - ");
        if (parts.length > 1) {
          text = `<b>${parts[0]}</b> - ${parts.slice(1).join(" - ")}`;
        }
      }

      return `<p>✅ ${text}</p>`;
    });

    return output.trim();
  }

  const transformedListHTML = transformListHTML(productData.cosmeticsDescription3.ro)

  //   return `${removeTrailingBracketAndDots(productData.shortDescription.ro)}
  //     ${removeTrailingBracketAndDots(productData.cosmeticsDescription1.ro)}
  //     ${removeTrailingBracketAndDots(productData.cosmeticsDescription2.ro)}
  //     ${
  //     productData.ingredientsTable[0].ingredient.pl !== ""
  //       ? `
  // <table class="table">
  //    <tbody>
  //       <tr class="tablehead">
  //          <td><strong>Informații suplimentare</strong></td>
  //          <td><strong>Cantitate per porție</strong></td>
  //          <td><strong>% Valoare zilnică</strong></td>
  //       </tr>
  //   ${ingredientsHTML}
  //    </tbody>
  // </table>
  // <p>* Valoarea zilnică nu a fost stabilită.</p>
  //   `
  //       : ""
  //   }
  //   ${removeTrailingBracketAndDots(productData.cosmeticsDescription3.ro)}
  //   ${removeTrailingBracketAndDots(productData.cosmeticsDescription4.ro)}
  //      `;
  return `
<div class="product-page-description description-banner-right" style="width:100%;max-width:100%;">
  <div class="product-page-description-text" style="width:100%;max-width:100%;">
    <div class="collapse-offset in" style="width:100%;max-width:100%;">
      <table border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border-spacing:0;table-layout:fixed;max-width:100%;">
        <tbody>
          <tr>
            <td colspan="2" style="padding:12px 12px 0 12px;vertical-align:top;">
              <h1 style="margin:0 0 10px 0;">${productData.productName.ro}</h1>
              ${productData.shortDescription.ro}
            </td>
          </tr>

          <tr>
            <td style="width:50%;padding:12px;vertical-align:middle;">
              <img
                alt="${productData.productName.ro}"
                src="https://elektropak.pl/subiekt_kopia/foto/${productData.productSku}^1.jpg"
                style="display:block;line-height:0;border:0px;text-decoration:none;height:600px;width:600px;"
              />
            </td>
            <td style="width:50%;padding:12px;vertical-align:middle;">
              ${productData.cosmeticsDescription1.ro}
            </td>
          </tr>

          <tr>
            <td style="width:50%;padding:12px;vertical-align:middle;">
              <img
                alt="${productData.productName.ro}"
                src="https://elektropak.pl/subiekt_kopia/foto/${productData.productSku}^2.jpg"
                style="display:block;line-height:0;border:0px;text-decoration:none;height:600px;width:600px;"
              />
            </td>
            <td style="width:50%;padding:12px;vertical-align:middle;">
              ${productData.cosmeticsDescription2.ro}
            </td>
          </tr>

          <tr>
            <td colspan="2" style="padding:12px;vertical-align:top;">
              ${productData.ingredientsTable[0].ingredient.ro !== "" ? `
                <table class="table" style="margin-top:10px;width:100%;border-collapse:collapse;">
                  <tbody>
                    <tr class="tablehead">
                      <td><strong>Informații suplimentare</strong></td>
                      <td><strong>Cantitate per porție</strong></td>
                      <td><strong>VNR</strong></td>
                    </tr>
                    ${ingredientsHTML}
                  </tbody>
                </table>
                ${productData.tableEnd.ro}
              ` : ""}

              ${transformedListHTML}
              ${productData.cosmeticsDescription4.ro}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

`;
};
