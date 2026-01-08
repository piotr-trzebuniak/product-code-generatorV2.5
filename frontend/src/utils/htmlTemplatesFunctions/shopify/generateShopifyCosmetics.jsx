import { removeTrailingBracketAndDots } from "../ebay/EN/generateEbayEnHtmlCosmetics";

export function cleanHtmlString(htmlString) {
  if (typeof htmlString !== 'string') return htmlString;
  let result = htmlString;
  
  // A) Połącz sąsiadujące akapity
  result = result.replace(/<\/p>\s*<p>/gi, ' ');
  result = result.replace(/\s{2,}/g, ' ');
  result = result.replace(/\s+<\/p>/gi, '</p>');
  
  // B) Usuń końcowe puste akapity/br
  result = result.replace(/(<p><br\s*\/?><\/p>\s*)+$/i, '');
  result = result.replace(/(<br\s*\/?>\s*)+<\/p>\s*$/i, '</p>');
  
  // C) Napraw podwójny ">" na końcu
  if (result.endsWith('>>')) {
    result = result.slice(0, -1);
  }
  
  // D) Usuń nadmiarowe kropki na końcu
  result = result.replace(/([>])\.+$/, '$1');
  result = result.replace(/\.+$/, '');
  
  // E) Usuń spacje przed interpunkcją i </strong>
  result = result.replace(/\s+,/g, ',');
  result = result.replace(/\s+\./g, '.');
  result = result.replace(/\s+<\/strong>/gi, '</strong>');
  
  // F) Końcowa normalizacja spacji
  result = result.replace(/\s{2,}/g, ' ');
  
  // G) Usuń znaczniki <strong> i <b> z nagłówków <h3>
  result = result.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (match, content) => {
    // Usuń wszystkie tagi <strong> i <b> z zawartości nagłówka
    const cleanContent = content
      .replace(/<\/?strong[^>]*>/gi, '')
      .replace(/<\/?b[^>]*>/gi, '');
    return `<h3>${cleanContent}</h3>`;
  });
  
  // H) Dodanie spacji po pogrubionych słowach, jeśli jej brakuje
  result = result.replace(/(<strong>.*?<\/strong>)(?=\S)/gi, '$1 ');
  
  return result;
}



export const generateIngredientsHTML = (ingredientsTable) => {
  let ingredientsHTML = "";

  ingredientsTable.forEach((ingredient) => {
    // główny składnik
    const name = ingredient.ingredient?.en || "";
    const value = ingredient.ingredientValue?.en || "";
    const rws = ingredient.rws === "<>" ? "*" : ingredient.rws || "";

    // sprawdź czy są dodatkowe linie
    if (ingredient.additionalLines && ingredient.additionalLines.length > 0) {
      // składnik z dodatkowymi liniami
      let combinedNames = `<strong>${name} <br></strong>`;
      let combinedValues = `${value}`;

      // dodaj dodatkowe linie
      ingredient.additionalLines.forEach((line, index) => {
        const lineName = line.ingredient?.en || "";
        const lineValue = line.ingredientValue?.en || "";

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

export const generateShopifyCosmetics = (productData) => {
  const ingredientsHTML = generateIngredientsHTML(productData.ingredientsTable);
  return ` 
    ${cleanHtmlString(productData.shortDescription.en)}
    ${cleanHtmlString(productData.cosmeticsDescription1.en)}
    ${cleanHtmlString(productData.cosmeticsDescription2.en)}
  ${
    productData.ingredientsTable[0].ingredient.pl !== ""
      ? `
<table class="table">
   <tbody>
      <tr class="tablehead">
         <td><strong>Supplemental Information</strong></td>
         <td><strong>Amount Per Serving</strong></td>
         <td><strong>% Daily Value</strong></td>
      </tr>
  ${ingredientsHTML}
   </tbody>
</table>
<p>* Daily Value not established.</p>
  `
      : ""
  }
    ${cleanHtmlString(productData.cosmeticsDescription3.en)}
    ${cleanHtmlString(productData.cosmeticsDescription4.en)}
  
     `;
};
