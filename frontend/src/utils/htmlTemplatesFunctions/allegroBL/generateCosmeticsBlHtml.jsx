import { generateIngredientsHTML, generateSpecialFeaturesList, minifyHtml } from "./generateBlHtml";

// Funkcja generująca HTML dla Baselinkera
export const generateCosmeticsBlHtml = (productData) => {
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

// function replaceStrongWithB(htmlString) {
//   return htmlString
//     .replace(/<strong>/g, "<b>")
//     .replace(/<\/strong>/g, "</b>");
// }


const transformedListHTML = transformListHTML(productData.cosmeticsDescription3.pl)
  const specialFeaturesHTML = generateSpecialFeaturesList(
    productData.specialFeatures
  );

  
    const newHtmlToBl = `
  <section class="section">
    <div class="item item-12">
      <section class="text-item">
        <h1>${productData.productName.pl}</h1>
        ${productData.shortDescription.pl}
      </section>
    </div>
  </section>
  <section class="section">
    <div class="item item-6">
      <section class="image-item">
        <img src="https://elektropak.pl/subiekt_kopia/foto/${productData.productSku}^1.jpg" />
      </section>
    </div>
    <div class="item item-6">
      <section class="text-item">
        ${productData.cosmeticsDescription1.pl}
      </section>
    </div>
  </section>

  <section class="section">
    <div class="item item-6">
      <section class="image-item">
        <img src="https://elektropak.pl/subiekt_kopia/foto/${productData.productSku}^2.jpg" />
      </section>
    </div>
    <div class="item item-6">
      <section class="text-item">
        ${productData.cosmeticsDescription2.pl}
      </section>
    </div>
  </section>
  
  ${productData.ingredientsTable[0].ingredient.pl !== "" ? `
    <section class="section">
    <div class="item item-12">
      <section class="text-item">
        <p><b>Składniki&nbsp; &nbsp;${productData.portion.portionAmount} ${
    productData.portion.unit.pl
  }&nbsp; &nbsp;RWS</b></p>
        <p><b>_________________________________________________</b></p>
        <table>${ingredientsHTML}</table>
        <p><b>_________________________________________________</b></p>
        ${productData.tableEnd.pl}
      </section>
    </div>
  </section>
  ` : ""}
  
  <section class="section">
    <div class="item item-12">
      <section class="text-item">
        
        ${transformedListHTML}
        ${specialFeaturesHTML}
        ${productData.cosmeticsDescription4.pl}
      </section>
    </div>
  </section>`;
  
    return minifyHtml(newHtmlToBl);
  };
  