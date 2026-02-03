export const replaceH2WithH3 = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Pobierz wszystkie elementy h2
  const h2Elements = doc.querySelectorAll('h2');
  
  // Pomiń pierwszy element h2, zacznij od indeksu 1
  for (let i = 1; i < h2Elements.length; i++) {
    const h2 = h2Elements[i];
    const h3 = document.createElement('h3');
    h3.innerHTML = h2.innerHTML;
    h2.replaceWith(h3);
  }

  // Usuwanie <strong> otaczających treść w <h3>
  doc.querySelectorAll('h3').forEach(h3 => {
    const strong = h3.querySelector('strong');
    if (strong && strong.textContent === h3.textContent) {
      h3.textContent = strong.textContent;
    }
  });

  return doc.body.innerHTML;
};

export const replaceH3WithH2 = (htmlString) => {
  return htmlString.replace(/<h3>/g, "<h2>").replace(/<\/h3>/g, "</h2>");
};

export const ingredientTableHtmlToShop = (ingredientsTable) => {
  return ingredientsTable
    .map((ingredient) => {
      // Podstawowy składnik
      let ingredientName = `<strong>${ingredient.ingredient?.pl || ""}</strong>`;
      let ingredientValue = ingredient.ingredientValue?.pl || ""; // Sprawdzamy, czy ingredientValue ma właściwość 'pl'
      let ingredientRws = ingredient.rws ? `${ingredient.rws}` : "";

      // Jeśli ingredientValue jest obiektem, wyciągamy wartość z 'pl'
      if (typeof ingredient.ingredientValue === "object" && ingredient.ingredientValue.pl) {
        ingredientValue = ingredient.ingredientValue.pl; // Wyciągamy wartość 'pl'
      }

      // Dodatkowe linie składnika
      if (ingredient.additionalLines && ingredient.additionalLines.length > 0) {
        ingredient.additionalLines.forEach((line) => {
          ingredientName += `<br>${line.ingredient?.pl || ""}`;

          // Obsługuje przypadek, gdy line.ingredientValue jest obiektem
          let additionalIngredientValue = line.ingredientValue?.pl || ""; 
          if (typeof line.ingredientValue === "object" && line.ingredientValue.pl) {
            additionalIngredientValue = line.ingredientValue.pl;
          }

          ingredientValue += `<br>${additionalIngredientValue}`; // Dodajemy do ingredientValue z dodatkowej linii
          ingredientRws += line.rws ? `<br>${line.rws}` : "";
        });
      }

      // Usuń zbędne <br> na końcu wartości, jeśli rws jest pusty
      ingredientRws = ingredientRws.replace(/(<br>)+$/, "");


      return `
        <tr>
          <td>${ingredientName}</td>
          <td>${ingredientValue}</td>
          <td>${ingredientRws}</td>
        </tr>`;
    })
    .join(""); // Łączy wszystkie wiersze w jeden ciąg
};




export const generateShopHtml = (productData) => {

  if (
    !productData ||
    !productData.ingredientsTable ||
    !Array.isArray(productData.ingredientsTable)
  ) {
    console.error("ingredientsTable is missing or not an array");
    return ""; // Zwracamy pusty string, jeśli ingredientsTable jest niewłaściwe
  }

  const ingredientsHTML = ingredientTableHtmlToShop(
    productData.ingredientsTable
  ); // Przekazujemy ingredientsTable

  const descriptionHTML = productData.description.pl
    ? `<section class="section"><div class="item item-12"><section class="text-item">${productData.description.pl}</section></div></section>`
    : "";

  return `
    <div class="row">
      <div class="col-md-6">
        <div class="left-column">
          ${descriptionHTML}
          <h3>O produkcie</h3>
          <p>Wielkość opakowania: <strong>${productData.size.sizeAmount} ${
    productData.size.unit.pl
  }</strong></p>
          <p>Porcja jednorazowa: <strong>${productData.portion.portionAmount} ${
    productData.portion.unit.pl
  }</strong></p>
          <p>Ilość porcji w opakowaniu: <strong>${
            productData.portionQuantity
          }</strong></p>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-lighter">
                <tr>
                  <th>Składniki</th>
                  <th>${productData.portion.portionAmount} ${
    productData.portion.unit.pl
  }</th>
                  <th>RWS</th>
                </tr>
              </thead>
              <tbody>
                ${ingredientsHTML}
              </tbody>
            </table>
          </div>
          ${productData.tableEnd.pl}
          <h3>Składniki</h3>
          ${productData.ingredients.pl}
        </div>
      </div>
      <div class="col-md-6">
        <div class="right-column">
          <h3>Sposób użycia</h3>
          ${productData.howToUse.pl}
          <h3>Przeciwwskazania</h3>
          ${productData.contraindications.pl}
          <h3>Przechowywanie</h3>
          ${productData.storage.pl}
          <h3>Informacja</h3>
          ${productData.additionalInformation.pl}
        </div>
      </div>
    </div>
  `;
};

