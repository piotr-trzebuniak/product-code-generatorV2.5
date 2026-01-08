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

export const generateEmagRo = (productData) => {
  const ingredientsHTML = generateIngredientsHTML(productData.ingredientsTable);
  return `${removeTrailingBracketAndDots(productData.shortDescription.ro)}
<h3>Informații suplimentare:</h3>
<p>Dimensiunea pachetului: <strong>${productData.size.sizeAmount} ${
    productData.size.unit.ro
  }</strong></p>
<p>Porție: <strong>${productData.portion.portionAmount} ${
    productData.portion.unit.ro
  }</strong></p>
<p>Porții pe recipient: <strong>${productData.portionQuantity}</strong></p>
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
<h3>Alte ingrediente:</h3>
${removeTrailingBracketAndDots(productData.ingredients.ro)}
<h3>Utilizare recomandată:</h3>
${removeTrailingBracketAndDots(productData.howToUse.ro)}
<h3>Atenție:</h3>
${removeTrailingBracketAndDots(productData.additionalInformation.ro)}
     `;
};
