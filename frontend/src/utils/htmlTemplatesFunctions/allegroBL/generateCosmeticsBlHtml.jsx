import { generateIngredientsHTML, generateSpecialFeaturesList, minifyHtml } from "./generateBlHtml";

// Funkcja generująca HTML dla Baselinkera
export const generateCosmeticsBlHtml = (productData) => {

  function transformListHTML(inputHtml) {
    // 1. Wyciągamy nagłówek h3 -> zamiana na h2 ORAZ usuwamy dwukropek
    let output = inputHtml.replace(
      /<h3[^>]*>\s*<strong>(.*?)<\/strong>\s*<\/h3>/gi,
      (match, content) => {
        // Usuwamy dwukropek z tekstu, który był w środku strong
        const cleanContent = content.replace(/:/g, "");
        return `<h2>${cleanContent}</h2>`;
      }
    );

    // 2. Usuwamy <ul> i </ul>
    output = output.replace(/<\/?ul[^>]*>/gi, "");

    // 3. Zamieniamy każdy <li> na <p>✅ ...</p>
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

  function removeColonsFromH3(html) {
    if (!html) return "";
    // Szukamy treści wewnątrz h3 i usuwamy dwukropek tylko z tej treści
    return html.replace(/(<h3[^>]*>)([\s\S]*?)(<\/h3>)/gi, (match, openTag, content, closeTag) => {
      // Usuwamy dwukropek z przechwyconego środka (content)
      const cleanContent = content.replace(/:/g, "");
      return openTag + cleanContent + closeTag;
    });
  }


  // function replaceStrongWithB(htmlString) {
  //   return htmlString
  //     .replace(/<strong>/g, "<b>")
  //     .replace(/<\/strong>/g, "</b>");
  // }

  const ingredientsHTML = generateIngredientsHTML(productData.ingredientsTable);
  const transformedListHTML = transformListHTML(productData.cosmeticsDescription3.pl)
  const specialFeaturesHTML = generateSpecialFeaturesList(
    productData.specialFeatures
  );
  const description3Clean = removeColonsFromH3(productData.cosmeticsDescription3.pl);
  const description4Clean = removeColonsFromH3(productData.cosmeticsDescription4.pl);




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
        <p><b>Składniki&nbsp; &nbsp;${productData.portion.portionAmount} ${productData.portion.unit.pl
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
        ${description4Clean}
      </section>
    </div>
  </section>`;

  return minifyHtml(newHtmlToBl);
};
