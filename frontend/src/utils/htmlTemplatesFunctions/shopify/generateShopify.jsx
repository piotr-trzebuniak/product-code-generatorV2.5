import { removeTrailingBracketAndDots } from "../ebay/EN/generateEbayEnHtmlCosmetics";
import { cleanHtmlString } from "./generateShopifyCosmetics";

export const generateIngredientsHTML = (ingredientsTable) => {
  let ingredientsHTML = "";

  const cleanValue = (val) => {
    if (!val) return "";
    // usuń " of" tylko jeśli występuje na końcu wartości
    return val.replace(/\s*of\s*$/i, "").trim();
  };

  ingredientsTable.forEach((ingredient) => {
    // główny składnik
    const name = ingredient.ingredient?.en || "";
    const value = cleanValue(ingredient.ingredientValue?.en || "");
    const rws = ingredient.rws === "<>" ? "*" : ingredient.rws || "";

    if (ingredient.additionalLines && ingredient.additionalLines.length > 0) {
      // składnik z dodatkowymi liniami
      let combinedNames = `<strong>${name} <br></strong>`;
      let combinedValues = `${value}`;

      ingredient.additionalLines.forEach((line, index) => {
        const lineName = line.ingredient?.en || "";
        const lineValue = cleanValue(line.ingredientValue?.en || "");

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
      // pojedynczy składnik
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


export const generateShopify = (productData) => {
  const ingredientsHTML = generateIngredientsHTML(productData.ingredientsTable);
  return ` 
${cleanHtmlString(productData.shortDescription.en)}
<h3>Supplements Facts:</h3>
<p>Package Size: <strong>${productData.size.sizeAmount} ${
    productData.size.unit.en
  }</strong></p>
<p>Serving Size: <strong>${productData.portion.portionAmount} ${
    productData.portion.unit.en
  }</strong></p>
<p>Servings Per Container: <strong>${productData.portionQuantity}</strong></p>
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
<h3>Other ingredients:</h3>
${removeTrailingBracketAndDots(productData.ingredients.en)}
<h3>Suggested use:</h3>
${removeTrailingBracketAndDots(productData.howToUse.en)}
<h3>Caution:</h3>
${removeTrailingBracketAndDots(productData.additionalInformation.en)}
     `;
};
