import { generateIngredientsHTML } from "./generateEmagRo";

;

export const generateEmagRoCosmetics = (productData) => {


  const ingredientsHTML = generateIngredientsHTML(productData.ingredientsTable);

  function replaceH3WithH2(html) {
  if (!html || typeof html !== "string") return html;

  return html
    .replace(/<h3([^>]*)>/gi, "<h2$1>")
    .replace(/<\/h3>/gi, "</h2>");
}



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

  const cosmeticsDescription1 = replaceH3WithH2(productData.cosmeticsDescription1.ro);
const cosmeticsDescription2 = replaceH3WithH2(productData.cosmeticsDescription2.ro);
const cosmeticsDescription4 = replaceH3WithH2(productData.cosmeticsDescription4.ro);


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
              ${cosmeticsDescription1}
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
              ${cosmeticsDescription2}
            </td>
          </tr>

          <tr>
            <td colspan="2" style="padding:12px;vertical-align:top;">
              ${productData.ingredientsTable[0].ingredient.ro !== "" ? `
                <table class="table" style="margin-top: 10px">
       <p><b>Ingrediente ${productData.portion.portionAmount} ${productData.portion.unit.ro
      } RWS</b></p>
        <p><b>_________________________________________________</b></p>
        ${ingredientsHTML}
        <p><b>_________________________________________________</b></p>
        ${productData.tableEnd.ro}
    </table>
              ` : ""}

              ${replaceH3WithH2(transformedListHTML)}
              ${cosmeticsDescription4}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

`;
};
