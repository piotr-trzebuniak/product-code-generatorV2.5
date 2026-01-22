export const minifyHtml = (html) =>
  (html ?? "")
    .replace(/[\n\r\t]+/g, "") // usuń nowe linie i taby
    .replace(/>\s+</g, "><") // usuń spacje między tagami
    .trim();

export const generateIngredientsHTML = (ingredientsTable) => {
  let ingredientsHTML = "";

  const normalize = (v) => (v ?? "").toString().trim();
  const removeReactFragments = (s) =>
    /^(?:<>|<\/>|<>\s*<\/>)$/.test(s) ? "" : s;

  ingredientsTable.forEach((ingredient) => {
    const nameText = normalize(ingredient.ingredient?.pl);
    const value = removeReactFragments(
      normalize(ingredient.ingredientValue?.pl)
    );
    const rws = removeReactFragments(normalize(ingredient.rws));

    const name = nameText ? `<b>${nameText}</b>` : "";

    const parts = [name, value, rws].filter(Boolean);
    ingredientsHTML += `<p>${parts.join(" ")}</p>`;

    if (ingredient.additionalLines?.length) {
      ingredient.additionalLines.forEach((line) => {
        const lineName = removeReactFragments(normalize(line.ingredient?.pl));
        const lineValue = removeReactFragments(
          normalize(line.ingredientValue?.pl)
        );
        const lineRws = removeReactFragments(normalize(line.rws));

        const lineParts = [lineName, lineValue, lineRws].filter(Boolean);
        ingredientsHTML += `<p>${lineParts.join(" ")}</p>`;
      });
    }
  });

  return ingredientsHTML;
};

export const generateSpecialFeaturesList = (specialFeatures) => {
  const featureNames = {
    gmoFree: "Bez GMO",
    soyaFree: "Bez soi",
    sugarFree: "Bez cukru",
    glutenFree: "Bez glutenu",
    lactoseFree: "Bez laktozy",
    fillersFree: "Bez wypełniaczy",
    crueltyFree: "Cruelty-Free",
    hipoalergic: "Hipoalergiczny",
    ketoFriendly: "Keto-friendly",
    lowCarb: "Niska zawartość węglowodanów",
    slowRelease: "Wolne uwalnianie",
    fastRelease: "Szybkie uwalnianie",
    filmCoatedTablet: "Tabletka powlekana",
    wegan: "Wegański",
    wegetarian: "Wegetariański",
    zeroWaste: "Zero waste",
  };

  const list = Object.keys(specialFeatures)
    .filter((key) => specialFeatures[key]) // wybiera tylko włączone cechy
    .map((key) => `<p>⭐ ${featureNames[key]}</p>`)
    .join(""); // skleja <li>...</li> w jeden ciąg

  return list ? `<h2>Cechy specjalne:</h2>${list}` : "";
};

function convertListToSection(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const listItems = tempDiv.querySelectorAll("li");

  let resultHTML = `
        <h2>Rola w organizmie:</h2>`;

  listItems.forEach((item) => {
    resultHTML += `<p>✅ ${item.textContent}</p>`;
  });

  return resultHTML;
}

function generateStudiesHTML_PL(data) {
  // Walidacja danych
  if (!data || !data.PL || !Array.isArray(data.PL.studies)) {
    console.log("Brak danych do wyświetlenia badań (PL.studies).");
    return "";
  }

  const studies = data.PL.studies;

  const html = `
  <section class="section">
  <div class="item item-12">
  <section class="text-item">
<h2>Badania kliniczne dot. działania substancji:</h2>
${studies
      .map(
        (study, index) => `
<p><b>${index + 1}. ${study.title}</b></p>
<p><b>➡️</b> ${study.description}</p>
<p><b>Link:</b> <a href="${study.link}" target="_blank" rel="noopener">${study.link
          }</a></p>
`
      )
      .join("")}
  </section>
  </div>
  </section>
`.trim();

  return html;
}

export const generateBlHtml = (productData) => {
  const ingredientsHTML = generateIngredientsHTML(productData.ingredientsTable);
  const researchHTML = generateStudiesHTML_PL(productData.research);
  const specialFeaturesHTML = generateSpecialFeaturesList(
    productData.specialFeatures
  );

  const descriptionHTML = productData.description.pl
    ? `<section class="section"><div class="item item-12"><section class="text-item">${productData.description.pl}</section></div></section>`
    : "";

  const finalHtml = `
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
        <img src="https://elektropak.pl/subiekt_kopia/foto/${productData.productSku
    }^1.jpg" />
      </section>
    </div>
    <div class="item item-6">
      <section class="text-item">
        <h2>O produkcie</h2>
        <p>Wielkość opakowania:<b> ${productData.size.sizeAmount} ${productData.size.unit.pl
    }</b></p>
        <p>Porcja jednorazowa: <b>${productData.portion.portionAmount} ${productData.portion.unit.pl
    }</b></p>
        <p>Ilość porcji w opakowaniu: <b>${productData.portionQuantity}</b></p>
        <h2>Sposób użycia:</h2>
        ${productData.howToUse.pl}
      </section>
    </div>
  </section>
    <section class="section">
    <div class="item item-6">
      <section class="image-item">
        <img src="https://elektropak.pl/subiekt_kopia/foto/${productData.productSku
    }^2.jpg" />
      </section>
    </div>
    <div class="item item-6">
      <section class="text-item">
      <h2>Przeciwwskazania:</h2>
        ${productData.contraindications.pl}
        <h2>Przechowywanie:</h2>
        ${productData.storage.pl}
      </section>
    </div>
  </section>


  <section class="section">
    <div class="item item-12">
      <section class="text-item">
        <p><b>Składniki ${productData.portion.portionAmount} ${productData.portion.unit.pl
    } RWS</b></p>
        <p><b>_________________________________________________</b></p>
        ${ingredientsHTML}
        <p><b>_________________________________________________</b></p>
        ${productData.tableEnd.pl}
      </section>
    </div>
  </section>


  
  ${descriptionHTML}
  
  <section class="section">
    <div class="item item-12">
      <section class="text-item">
        ${specialFeaturesHTML}
        <h2>Składniki</h2>
        ${productData.ingredients.pl}
        <h2>Informacja</h2>
        ${productData.additionalInformation.pl}
      </section>
    </div>
  </section>`;

  return minifyHtml(finalHtml)
};
