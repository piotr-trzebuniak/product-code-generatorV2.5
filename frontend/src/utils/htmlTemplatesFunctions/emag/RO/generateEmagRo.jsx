export const generateSpecialFeaturesList = (specialFeatures) => {
  const featureNames = {
    gmoFree: "Fără GMO",
    soyaFree: "Fără soia",
    sugarFree: "Fără adaos de zahăr",
    glutenFree: "Fără gluten",
    lactoseFree: "Fără lactoză",
    fillersFree: "Fără conservanți",
    crueltyFree: "Cruelty-free",
    hipoalergic: "Hipoalergenic",
    ketoFriendly: "Keto-friendly",
    lowCarb: "Conținut scăzut de carbohidrați",
    slowRelease: "Eliberare lentă",
    fastRelease: "Eliberare rapidă",
    filmCoatedTablet: "Comprimat filmat",
    wegan: "Vegan",
    wegetarian: "Vegetarian",
    zeroWaste: "Zero deșeuri",
  };


  const list = Object.keys(specialFeatures)
    .filter((key) => specialFeatures[key]) // wybiera tylko włączone cechy
    .map((key) => `<p>⭐ ${featureNames[key]}</p>`)
    .join(""); // skleja <li>...</li> w jeden ciąg

  return list ? `<h2>Caracteristici speciale</h2>${list}` : "";
};

export const generateIngredientsHTML = (ingredientsTable) => {
  let ingredientsHTML = "";

  const normalize = (v) => (v ?? "").toString().trim();
  const removeReactFragments = (s) =>
    /^(?:<>|<\/>|<>\s*<\/>)$/.test(s) ? "" : s;

  ingredientsTable.forEach((ingredient) => {
    const nameText = normalize(ingredient.ingredient?.ro);
    const value = removeReactFragments(
      normalize(ingredient.ingredientValue?.ro)
    );
    // const rws = removeReactFragments(normalize(ingredient.rws));
    const rws = normalize(ingredient.rws);

    const name = nameText ? `<b>${nameText}</b>` : "";

    const parts = [name, value, rws].filter(Boolean);
    ingredientsHTML += `<p>${parts.join(" ")}</p>`;

    if (ingredient.additionalLines?.length) {
      ingredient.additionalLines.forEach((line) => {
        const lineName = removeReactFragments(normalize(line.ingredient?.ro));
        const lineValue = removeReactFragments(
          normalize(line.ingredientValue?.ro)
        );
        // const lineRws = removeReactFragments(normalize(line.rws));
        const lineRws = normalize(line.rws);

        const lineParts = [lineName, lineValue, lineRws].filter(Boolean);
        ingredientsHTML += `<p>${lineParts.join(" ")}</p>`;
      });
    }
  });

  return ingredientsHTML;
};

export const generateEmagRo = (productData) => {
  const ingredientsHTML = generateIngredientsHTML(productData.ingredientsTable);
  const specialFeaturesHTML = generateSpecialFeaturesList(
    productData.specialFeatures
  );
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
			<td style="width:50%;padding:12px;vertical-align:middle;"><img alt="${productData.productName.ro}" src="https://elektropak.pl/subiekt_kopia/foto/${productData.productSku
    }^1.jpg" style="display:block;line-height:0;border:0px;text-decoration:none;height:600px;width:600px;" /></td>
			<td style="width:50%;padding:12px;vertical-align:middle;">
			<h2 style="margin:14px 0 8px 0;">Informatii de baza</h2>
			<p style="margin:0 0 6px 0;">Dimensiunea ambalajului: <strong>${productData.size.sizeAmount} ${productData.size.unit.ro
    }</strong></p>
			<p style="margin:0 0 6px 0;">Portie unica: <strong>${productData.portion.portionAmount} ${productData.portion.unit.ro
    }</strong></p>
			<p style="margin:0;">Numar portii per ambalaj: <strong>${productData.portionQuantity}</strong></p>

			<h2 style="margin:14px 0 0 0;">Mod de utilizare</h2>
			${productData.howToUse.ro}
			</td>
		</tr>
		<tr>
			<td style="width:50%;padding:12px;vertical-align:middle;"><img alt="${productData.productName.ro}" src="https://elektropak.pl/subiekt_kopia/foto/${productData.productSku
    }^2.jpg" style="display:block;line-height:0;border:0px;text-decoration:none;height:600px;width:600px;" /></td>
			<td style="width:50%;padding:12px;vertical-align:middle;">
			<h2 style="margin:0 0 8px 0;">Contraindicații</h2>
			${productData.contraindications.ro}
			<h2 style="margin:0 0 8px 0;">Depozitare</h2>
			${productData.storage.ro}
			</td>
		</tr>
		<tr>
			<p> </p>
      <table class="table" style="margin-top: 10px">
       <p><b>Składniki ${productData.portion.portionAmount} ${productData.portion.unit.ro
    } RWS</b></p>
        <p><b>_________________________________________________</b></p>
        ${ingredientsHTML}
        <p><b>_________________________________________________</b></p>
        ${productData.tableEnd.ro}
    </table>

	${specialFeaturesHTML}
  <h2 style="margin:0 0 8px 0;">Ingrediente</h2>
  ${productData.ingredients.ro}
  <h2 style="margin:15px 0 8px 0;">Informații suplimentare</h2>
  ${productData.additionalInformation.ro}
			</td>
		</tr>
	</tbody>
</table>
</div>
</div>
</div>

`;
};
