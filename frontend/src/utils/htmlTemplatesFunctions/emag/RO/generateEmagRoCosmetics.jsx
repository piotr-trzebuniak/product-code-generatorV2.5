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
  return `${removeTrailingBracketAndDots(productData.shortDescription.ro)}
    ${removeTrailingBracketAndDots(productData.cosmeticsDescription1.ro)}
    ${removeTrailingBracketAndDots(productData.cosmeticsDescription2.ro)}
    ${
    productData.ingredientsTable[0].ingredient.pl !== ""
      ? `
<table class="table">
   <tbody>
      <tr class="tablehead">
         <td><strong>Informații suplimentare</strong></td>
         <td><strong>Cantitate per porție</strong></td>
         <td><strong>% Valoare zilnică</strong></td>
      </tr>
  ${ingredientsHTML}
   </tbody>
</table>
<p>* Valoarea zilnică nu a fost stabilită.</p>
  `
      : ""
  }
  ${removeTrailingBracketAndDots(productData.cosmeticsDescription3.ro)}
  ${removeTrailingBracketAndDots(productData.cosmeticsDescription4.ro)}
     `;
};
