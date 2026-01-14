import { featuresMapIT } from "../../../featureMaps/featuresMapIT";
import { generateRoleHtml } from "../DE/generateEbayDeHtmlCosmetics";
import { removeTrailingBracketAndDots } from "../EN/generateEbayEnHtmlCosmetics";


export const ingredientTableHtmlToShop = (ingredientsTable) => {
  return ingredientsTable
    .map((ingredient) => {
      // Podstawowy składnik
      let ingredientName = `<strong>${
        ingredient.ingredient?.it || ""
      }</strong>`;
      let ingredientValue = ingredient.ingredientValue?.it || ""; // Sprawdzamy, czy ingredientValue ma właściwość 'pl'
      let ingredientRws = ingredient.rws ? `${ingredient.rws}` : "";

      // Jeśli ingredientValue jest obiektem, wyciągamy wartość z 'pl'
      if (
        typeof ingredient.ingredientValue === "object" &&
        ingredient.ingredientValue.it
      ) {
        ingredientValue = ingredient.ingredientValue.it; // Wyciągamyy wartość 'pl'
      }

      // Dodatkowe linie składnika
      if (ingredient.additionalLines && ingredient.additionalLines.length > 0) {
        ingredient.additionalLines.forEach((line) => {
          ingredientName += `<br>${line.ingredient?.it || ""}`;

          // Obsługuje przypadek, gdy line.ingredientValue jest obiektem
          let additionalIngredientValue = line.ingredientValue?.it || "";
          if (
            typeof line.ingredientValue === "object" &&
            line.ingredientValue.it
          ) {
            additionalIngredientValue = line.ingredientValue.it;
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

function extractIngredientsAndRemove(htmlString) {
  // Wzorzec do znalezienia nagłówka i akapitu ze składnikami (alternatywa dla "Inhaltsstoffe" i "Zutaten")
  const pattern = /<h3><strong>(Ingredienti|Zutaten):<\/strong><\/h3><p>([^<]*)<\/p>/i;
  
  // Szukaj dopasowania
  const match = htmlString.match(pattern);
  
  if (!match) {
    console.log('Nie znaleziono nagłówka "Ingredienti:" lub składników');
    return {
      extractedText: '',
      modifiedHtml: htmlString
    };
  }
  
  // Wyekstrahowany tekst składników (grupa 2 z wyrażenia regularnego)
  const extractedText = match[2].trim();
  
  // Usuń cały znaleziony fragment z HTML
  const modifiedHtml = htmlString.replace(match[0], '');
  
  return {
    extractedText: extractedText,
    modifiedHtml: modifiedHtml
  };
}


// export const generateRoleHtml = (htmlString) => {
//   const ICON_URL = "https://elektropak.pl/ebay/role-icon.png";
  
//   // Zidentyfikuj nagłówek
//   const headerMatch = htmlString.match(/<h3><strong>(.*?)<\/strong><\/h3>/);
//   const headerText = headerMatch ? headerMatch[1] : "";
  
//   if (!headerMatch) {
//     return htmlString;
//   }
  
//   // Poprawiony regex - elastyczny co do spacji wokół myślnika
//   const bulletpoints = [...htmlString.matchAll(/<li><strong>(.*?)<\/strong>\s*-\s*(.*?)<\/li>/g)].map(
//     (match) => ({
//       title: match[1].trim(),
//       description: match[2].trim()
//     })
//   );
  
//   // Generowanie HTML
//   const headerHtml = headerText ? `<h3><strong>${headerText}</strong></h3>` : '';
    
//   const listHtml = bulletpoints
//     .map(
//       ({ title, description }) => `
//         <div class="role">
//           <img src="${ICON_URL}" alt="" />
//           <span><strong>${title}</strong> - ${description}</span>
//         </div>`
//     )
//     .join("");
  
//   return headerHtml + listHtml;
// };


export const generateFeatureHtml = (specialFeatures, featuresMapIT) => {
  const ICON_BASE_URL = "https://elektropak.pl/ebay/icons/";

  const enabledFeatures = Object.entries(specialFeatures).filter(
    ([key, value]) => value && featuresMapIT[key]
  );

  if (enabledFeatures.length === 0) {
    return "";
  }

  return enabledFeatures
    .map(
      ([key]) => `
        <div class="property">
          <img
            src="${ICON_BASE_URL}${featuresMapIT[key].icon}"
            alt=""
            srcset=""
          />
          <span>${featuresMapIT[key].label}</span>
        </div>`
    )
    .join("");
};


export const generateEbayItHtmlCosmetics = (productData) => {
  if (
    !productData ||
    !productData.ingredientsTable ||
    !Array.isArray(productData.ingredientsTable)
  ) {
    console.error("ingredientsTable is missing or not an array");
    return ""; // Zwracamy pusty string, jeśli ingredientsTable jest niewłaściwe
  }

  const editedCosmeticsDescription4 = extractIngredientsAndRemove(productData.cosmeticsDescription4.it)


  const ingredientsHTML = ingredientTableHtmlToShop(
    productData.ingredientsTable
  ); // Przekazujemy ingredientsTable

  const descriptionHTML = productData.description.pl
    ? `<section class="section"><div class="item item-12"><section class="text-item">${productData.description.pl}</section></div></section>`
    : "";

  return `
     <head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap"
    rel="stylesheet"
  />
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
    crossorigin="anonymous"
  />
</head>

<body>
  <header class="header">
    <div class="container container__header">
      <a href="#">
        <img
          class="header__logo"
          src="https://medpak.shop/cdn/shop/files/Logotyp_Medpak_z_haslem_eng_color_poziom.svg?v=1681297580&width=190"
          alt=""
          srcset=""
        />
      </a>

      <!-- <img class="nav-mobile-icon" src="burger-bar.png" alt="" srcset="" /> -->
            <nav class="header__nav">
        <a
          for="tab1-btn"
          class="header__nav-item"
          href="https://www.ebay.it/str/medpaksupplements?_tab=feedback"
          >Feedback sul venditore</a
        >
        <a
          for="tab2-btn"
          class="header__nav-item"
          href="https://www.ebay.it/str/medpaksupplements"
        >
          Tutti gli oggetti</a
        >
        <a
          for="tab4-btn"
          class="header__nav-item"
          href="https://www.ebay.it/str/medpaksupplements?_tab=about"
          >Chi siamo</a
        >
      </nav>
    </div>
  </header>
  <!-- 
  <nav class="nav-mobile">
    <a href="#">Beschreibung</a>
    <a href="#">Bezahlung</a>
    <a href="#">Versand</a>
    <a href="#">Über Uns</a>
    <a href="#">Kontakt</a>
  </nav> -->

  <main>
    <div class="tabBar">
      <input type="radio" checked name="tab" id="tab1-btn" />
      <input type="radio" name="tab" id="tab2-btn" />
      <input type="radio" name="tab" id="tab3-btn" />
      <input type="radio" name="tab" id="tab4-btn" />
      <input type="radio" name="tab" id="tab5-btn" />
      <!-- tab 1 -->
      <div id="tab1">
        <div class="top-section">
          <div class="container container__top-section">
            <div class="product-name">
              <h2>${productData.productName.it}</h2>
            </div>
            <div class="gallery">
              <div id="item-1" class="control-operator"></div>
              <div id="item-2" class="control-operator"></div>
              <div id="item-3" class="control-operator"></div>
              <div id="item-4" class="control-operator"></div>
              <!--  Items to Show    -->
              <figure class="item bigPic">
                <img src="https://elektropak.pl/subiekt_kopia/foto/${
                  productData.productSku
                }^1.jpg" />
              </figure>
              <figure class="item bigPic">
                <img src="https://elektropak.pl/subiekt_kopia/foto/${
                  productData.productSku
                }^2.jpg" />
              </figure>
              <figure class="item bigPic">
                <img src="https://elektropak.pl/subiekt_kopia/foto/${
                  productData.productSku
                }^3.jpg" />
              </figure>
              <figure class="item bigPic">
                <img src="https://elektropak.pl/subiekt_kopia/foto/${
                  productData.productSku
                }^4.jpg" />
              </figure>

              <!-- Thumbnails     -->
              <div class="controls galleryNav">
                <a class="control-item galleryThumb" href="#item-1">
                    <img src="https://elektropak.pl/subiekt_kopia/foto/${
                      productData.productSku
                    }^1.jpg" />
                </a>
                <a class="control-item galleryThumb" href="#item-2">
                    <img src="https://elektropak.pl/subiekt_kopia/foto/${
                      productData.productSku
                    }^2.jpg" />
                </a>
                <a class="control-item galleryThumb" href="#item-3">
                    <img src="https://elektropak.pl/subiekt_kopia/foto/${
                      productData.productSku
                    }^3.jpg" />
                </a>
                <a class="control-item galleryThumb" href="#item-4">
                    <img src="https://elektropak.pl/subiekt_kopia/foto/${
                      productData.productSku
                    }^4.jpg" />
                </a>
              </div>
            </div>
            <div class="right-side">
              <div class="short-description">
                <h2>${productData.productName.it}</h2>
                ${removeTrailingBracketAndDots(productData.shortDescription.it)}
              </div>
              <!-- <div class="variants">
                <h3>Grösse:</h3>
                <div class="variant-grid">
                  <a href="#" class="variant"
                    >Swanson Full Spectrum Ashwagandha 450 mg
                    <b>100 Capsules</b>
                  </a>
                  <a href="#" class="variant"
                    >Swanson Full Spectrum Ashwagandha 450 mg
                    <b>200 Capsules</b>
                  </a>
                </div>
              </div> -->
              <div class="bulletpoints">
              <div class="roles">
                ${generateRoleHtml(productData.cosmeticsDescription3.it)}
              </div>
              </div>
              <div class="properties">
                ${generateFeatureHtml(
                  productData.specialFeatures,
                  featuresMapIT
                )}
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-section">
          <div class="container">
            <div class="description section">
              <div class="description__heading">
                <img
                  src="https://elektropak.pl/ebay/heading-icons/description-heading-icon.png"
                  alt=""
                />
                <h4 class="section-heading">Descrizione del</h4>
              </div>
              <div class="description__content">
            
                <div class="row">
                  <div class="col-md-6">
                    <div class="left-column">
                    ${removeTrailingBracketAndDots(productData.cosmeticsDescription1.it)}
                    <br>
                    ${removeTrailingBracketAndDots(productData.cosmeticsDescription2.it)}
                     ${productData.ingredientsTable[0].ingredient.it !== "" ? `
            <div class="table-responsive">
              <table class="table table-hover">
              <thead class="table-lighter">
                <tr>
                  <th>Ingredienti</th>
                  <th>${productData.portion.portionAmount} ${productData.portion.unit.it}</th>
                  <th>RM</th>
                </tr>
              </thead>
              <tbody>
                ${ingredientsHTML}
              </tbody>
              </table>
            </div>
            ${productData.tableEnd.it}
                      ` : ""}

                     
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="right-column">
                      ${removeTrailingBracketAndDots(editedCosmeticsDescription4.modifiedHtml)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
<!-- 
            <div class="similar-products section">
              <div class="similar-products__heading">
                <img
                  src="https://elektropak.pl/ebay/heading-icons/similar-heading-icon.png"
                  alt=""
                />
                <h4 class="section-heading">Ähnliche Produkte</h4>
              </div>
              <div class="similar-products__content">
                <table class="similar-products__table">
                  <tbody>
                    <tr>
                      <td
                        class="similar-products__table-blank specialBorderLeftRight"
                      >
                        &nbsp;
                      </td>
                      <td class="specialBorderLeftRight">
                        <div class="similar-products__table-heading">
                          <a href="#"
                            ><img
                              src="https://elektropak.pl/subiekt_kopia/foto/ARA179^1.jpg"
                              alt=""
                          /></a>
                          <span
                            >Vitaler's Ashwagandha 9% 600 mg - 60 Capsules</span
                          >
                        </div>
                      </td>
                      <td>
                        <div class="similar-products__table-heading">
                          <a href="#"
                            ><img
                              src="https://i.postimg.cc/L8p0bSPW/similar-product2.png"
                              alt=""
                          /></a>
                          <span>Ostrovit Ashwagandha - 200 Tabletten</span>
                        </div>
                      </td>
                      <td class="hidden1">
                        <div class="similar-products__table-heading">
                          <a href="#"
                            ><img
                              src="https://i.postimg.cc/dVjSMfmV/similar-product3.png"
                              alt=""
                          /></a>
                          <span
                            >Medverita Ashwagandha-Extrakt 9% - 120
                            Kapseln</span
                          >
                        </div>
                      </td>
                      <td class="hidden2">
                        <div class="similar-products__table-heading">
                          <a href="#"
                            ><img
                              src="https://i.postimg.cc/8CyKcrY8/similar-product4.png"
                              alt=""
                          /></a>
                          <span
                            >MyVita Ashwagandha 100 mg - 60 Gummiartign</span
                          >
                        </div>
                      </td>
                    </tr>
                    <tr class="similar-products__table-gray">
                      <td class="specialBorderLeftRight"><b>Menge</b></td>
                      <td class="specialBorderLeftRight">60</td>
                      <td>200</td>
                      <td class="hidden1">120</td>
                      <td class="hidden2">60</td>
                    </tr>
                    <tr>
                      <td class="specialBorderLeftRight"><b>Tagesdosis</b></td>
                      <td class="specialBorderLeftRight">600 mg</td>
                      <td>375 mg</td>
                      <td class="hidden1">500 mg</td>
                      <td class="hidden2">100 mg</td>
                    </tr>
                    <tr class="similar-products__table-gray">
                      <td class="specialBorderLeftRight">
                        <b>Portionen pro Behälter</b>
                      </td>
                      <td class="specialBorderLeftRight">60</td>
                      <td>200</td>
                      <td class="hidden1">120</td>
                      <td class="hidden2">60</td>
                    </tr>
                    <tr>
                      <td class="specialBorderLeftRight"><b>Produktart</b></td>
                      <td class="specialBorderLeftRight">Capsules</td>
                      <td>Tabletten</td>
                      <td class="hidden1">Kapseln</td>
                      <td class="hidden2">Gummiartign</td>
                    </tr>
                    <tr class="similar-products__table-gray">
                      <td class="specialBorderLeftRight"><b>Vegan</b></td>
                      <td class="specialBorderLeftRight">✔</td>
                      <td>✔</td>
                      <td class="hidden1">✘</td>
                      <td class="hidden2">✔</td>
                    </tr>
                    <tr>
                      <td class="specialBorderLeftRight"><b>Glutenfrei</b></td>
                      <td class="specialBorderLeftRight">✔</td>
                      <td>✘</td>
                      <td class="hidden1">✘</td>
                      <td class="hidden2">✔</td>
                    </tr>
                    <tr class="similar-products__table-gray">
                      <td class="specialBorderLeftRight"><b>Laktosefrei</b></td>
                      <td class="specialBorderBottom specialBorderLeftRight">
                        ✘
                      </td>
                      <td>✔</td>
                      <td class="hidden1">✘</td>
                      <td class="hidden2">✔</td>
                    </tr>
                    <tr>
                      <td class="similar-products__table-bordernone2">&nbsp</td>
                      <td class="similar-products__table-bordernone">&nbsp</td>
                      <td class="similar-products__table-bordernone">&nbsp</td>
                      <td class="similar-products__table-bordernone hidden1">
                        &nbsp
                      </td>
                      <td class="hidden2">&nbsp</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div> -->
          ${editedCosmeticsDescription4.extractedText ?
            `
            <a name="researches"></a>
            <div id="researches" class="researches section">
              <div class="researches__heading">
                <img
                  src="https://elektropak.pl/ebay/heading-icons/researches-heading-icon.png"
                  alt=""
                />
                <h4 class="section-heading">Ingredienti</h4>
              </div>
              <p>${editedCosmeticsDescription4.extractedText}</p>
            </div>`
            : ''}
            <!-- <div class="propositions section">
              <div class="propositions__heading">
                <img
                  src="https://elektropak.pl/ebay/heading-icons/similar-products-heading-icon.png"
                  alt=""
                />
                <h4 class="section-heading">Häufig zusammen gekauft</h4>
              </div>
              <div class="propositions__content">
                <a href="#" class="propositions__box">
                  <img
                    src="https://i.postimg.cc/WzyX8Lv5/proposition1.png"
                    alt=""
                  />
                  <span>Swanson Chrom Picolinat 200 mcg - 100 Kapseln</span>
                </a>
                <a href="#" class="propositions__box">
                  <img
                    src="https://i.postimg.cc/tRvSpPxF/proposition2.png"
                    alt=""
                  />
                  <span>Vitaler's Chrom 200 mcg - 180 Tabletten</span>
                </a>
                <a href="#" class="propositions__box">
                  <img
                    src="https://i.postimg.cc/NfyNMM6S/proposition3.png"
                    alt=""
                  />
                  <span
                    >Swanson Anti-Gas-Enzym 40 mg - 90 pflanzliche Kapseln</span
                  >
                </a>
                <a href="#" class="propositions__box">
                  <img
                    src="https://i.postimg.cc/YqJdmH89/proposition4.png"
                    alt=""
                  />
                  <span>Vitaler's Maca 600 mg - 60 Kapseln</span>
                </a>
                <a href="#" class="propositions__box">
                  <img
                    src="https://i.postimg.cc/P5Y2WRFM/proposition5.png"
                    alt=""
                  />
                  <span
                    >Swanson Vitamin D3 5000 IU (125 mcg) - 250
                    Weichkapseln</span
                  >
                </a>
                <a href="#" class="propositions__box">
                  <img
                    src="https://i.postimg.cc/YS78bz5B/proposition6.png"
                    alt=""
                  />
                  <span>Swanson NAC N-Acetylcystein 600 mg - 100 Kapseln</span>
                </a>
                <a href="#" class="propositions__box">
                  <img
                    src="https://i.postimg.cc/6QhcSGK2/proposition7.png"
                    alt=""
                  />
                  <span
                    >Solgar Vitamin D3 250 mcg (10000 IU) - 120
                    Weichkapseln</span
                  >
                </a>
                <a href="#" class="propositions__box">
                  <img
                    src="https://i.postimg.cc/ydYjzY6f/proposition8.png"
                    alt=""
                  />
                  <span
                    >Puritan's Pride Knoblauchöl 1000 mg - 100
                    Weichkapseln</span
                  >
                </a>
              </div>
            </div> -->
            <div class="product-series section">
              <div class="product-series__heading">
                <img
                  src="https://elektropak.pl/ebay/heading-icons/series-heading-icon.png"
                  alt=""
                />
                <h4 class="section-heading">Le nostre gamme di prodotti</h4>
              </div>
              <div class="product-series__content">
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=36534928016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria8.png"
                    alt=""
                  />
                  <span>Aromaterapia</span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257246016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria2.png"
                    alt=""
                  />
                  <span>Integratori a base di erbe</span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257247016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria3.png"
                    alt=""
                  />
                  <span>La salute dei bambini</span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257248016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria4.png"
                    alt=""
                  />
                  <span>Vitamine</span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=36534927016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria5.png"
                    alt=""
                  />
                  <span>Integratori alimentari</span>

                  <span></span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257249016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria6.png"
                    alt=""
                  />
                  <span>Sesso e contraccezione</span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257250016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria7.png"
                    alt=""
                  />
                  <span>Integratori di proteine</span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257297016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria8.png"
                    alt=""
                  />
                  <span>Sistema immunitario</span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257298016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria9.png"
                    alt=""
                  />
                  <span>Cosmetici</span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257299016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria10.png"
                    alt=""
                  />
                  <span>Alimentazione sana</span>
                </a>
                <a href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257300016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria11.png"
                    alt=""
                  />
                  <span>Erbe e miscele</span>
                </a>
                <a
                  href="https://www.ebay.it/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257301016"
                  class="product-series__box"
                >
                  <img
                    src="https://elektropak.pl/ebay/series/seria12.png"
                    alt=""
                  />
                  <span>Articolazioni e ossa</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- tab 2 -->
      <div id="tab2">
        <h2>Podstrona 2</h2>
      </div>
      <!-- tab 3 -->
      <div id="tab3">
        <h2>Podstrona 3</h2>
      </div>
      <!-- tab 4 -->
      <div id="tab4">
        <h2>Podstrona 4</h2>
      </div>
      <div id="tab5">
        <h2>Podstrona 5</h2>
      </div>
    </div>
  </main>

</body>

<style>
  .container {
    max-width: 1300px;
    width: 100%;
    margin: 0 auto;
    padding-top: 1em;
    font-family: "Mulish";
    padding: 0em;
  }
  body {
    margin: 0;
    padding: 0;
    background-color: #f2f2f2;
  }

  .header {
    border-bottom: 1px #e7e7e7 solid;
    background-color: #fff;
  }

  .container__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1em 0;
  }

  .header__logo {
    width: 200px;
    height: 57px;
  }

  /* .section {
    border: 1px #e7e7e7 solid;
  } */

  /* DESKTOP NAV */

  .header__nav {
    display: none;
  }
  .header__nav-item {
    text-decoration: none;
    color: #424242;
    font-size: 16px;
    padding-left: 2em;
    transition: text-decoration 0.5s;
    cursor: pointer;
  }
  .header__nav-item:hover {
    text-decoration: underline;
  }

  /* NAV MOBILE */

  .nav-mobile-icon {
    width: 50px;
    height: 50px;
    cursor: pointer;
  }

  .nav-mobile {
    display: none;
    flex-direction: column;
    text-align: center;
    padding: 1em 0;
    border-bottom: 1px #e7e7e7 solid;
  }
  /* .nav-mobile--active {
    display: flex;
  } */

  .nav-mobile a {
    text-decoration: none;
    padding: 0.3em;
    color: #000;
    transition: text-decoration 0.5s;
  }
  .nav-mobile a:hover {
    text-decoration: underline;
  }

  @media (min-width: 750px) {
    .nav-mobile {
      display: none;
    }
    .nav-mobile-icon {
      display: none;
    }

    .header__nav {
      display: flex;
    }
  }

  /* MAIN */

  main h2 {
    margin: 0 0 1em 0;
  }

  /* TOP SECTION */

  .top-section {
    background-color: #fff;
    padding-top: 1em;
    border-bottom: 1px solid #e7e7e7;
    padding-bottom: 2em;
  }

  .container__top-section {
    display: flex;
    flex-direction: column;
    padding: 0 0.2em;
  }

  .product-name {
    align-items: stretch;
  }

  .product-name h2 {
    font-size: 18px;
    font-weight: 700;
  }

  /* VARIANTS */

  .variant-grid {
    display: flex;
    gap: 0.5em;
    justify-content: center;
  }

  .variant {
    display: inline-block;
    border: 1px solid #e7e7e7;
    border-radius: 10px;
    padding: 0.5em 0.8em;
    font-size: 12px;
    text-align: center;
    max-width: 240px;
    cursor: pointer;
    transition: background-color 0.5s;
    text-decoration: none;
    color: #000;
  }

  .variant:hover {
    background-color: #e7e7e7;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 0.7em 0;
  }

  /* SHORT DESCRIPTIONS */

  .short-description p {
    font-size: 14px;
  }

  .short-description h2 {
    display: none;
    font-size: 1.3rem;
    font-weight: 700;
  }

  /* ROLES */

  .role {
    display: flex;
    align-items: center;
    padding: 0.2em;
    font-size: 14px;
    font-weight: 500;
  }

  .role img {
    margin-right: 0.5em;
  }

  /* PROPERTIES */

  .properties {
    /* display: grid;
    grid-template-columns: repeat(3, 1fr); */
    margin-top: 1em;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  .property {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1em;
    padding: 0 0.5em;
  }

  .property img {
    width: 40px;
    height: 40px;
    padding-bottom: 0.3em;
  }

  .property span {
    font-size: 12px;
  }

  .section-heading {
    margin: 0;
    font-size: 19px;
    font-weight: 600;
    padding-left: 0.5em;
  }
  @media (min-width: 700px) {
    .section-heading {
      font-size: 22px;
    }
    .property img {
      width: 50px;
      height: 50px;
    }
    .properties {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  /* DESCRIPTION SECTION  */

  .description {
    background-color: #fff;
  }

  .description__heading {
    display: flex;
    align-items: center;
    border-bottom: 1px #e5e5e5 solid;
    padding: 0.8em 0;
  }

  .col-md-6 {
    padding: 0;
  }

  @media (min-width: 700px) {
    .property span {
      font-size: 14px;
    }

    .description__heading {
      padding: 0.8em 1em;
    }
    .col-md-6 {
      padding: 1em;
    }
    .variant-grid {
      justify-content: start;
    }
    .variant {
      font-size: 14px;
      max-width: 180px;
    }
  }

  .description__content {
    border-top: none;
    padding: 1em;
    padding-top: 2em;
  }
  .description__content h5 {
    font-weight: 600;
    font-size: 21px;
    padding-bottom: 0.3em;
  }
  .description__content p, .description__content li {
    margin: 0.4em 0;
    font-size: 14px;
  }

  /* RESEARCHES SECTION  */

  .researches {
    background-color: #fff;
    border-top: 1px #e5e5e5 solid;
  }
  .researches p {
  padding: 1em;
  font-size: 14px;
  }

  .researches__heading {
    display: flex;
    align-items: center;
    border-bottom: 1px #e5e5e5 solid;
    border-top: 1px #e5e5e5 solid;
    border-top: none;
    padding: 0.8em 0.2em;
  }
   .researches__content {
    /* border: 1px #e5e5e5 solid; */
    border-top: none;
    padding: 1em 0.2em;
    padding-top: 2em;
    margin-bottom: 0.5em;
  }

  @media (min-width: 700px) {
    .researches__heading {
      padding: 0.8em 1em;
    }
    .researches__content {
      padding: 1em !important;
    }
  }
  .researches__content h5 {
    font-weight: 700;
    font-size: 16px;
  }

  .researches__content p, .researches__content a {
    font-style: italic;
    font-weight: 500;
    font-size: 14px;
    text-decoration: none;
    color: #000;
    display: inline-block;
    margin-bottom: 0.6em;
    transition: text-decoration 0.5s;
  }

  .researches__content a:hover {
    text-decoration: underline;
  }

  /* SIMILAR-PRODUCTS SECTION  */

  .similar-products {
    background-color: #fff;
    display: none;
    border-top: 1px #e5e5e5 solid;
  }

  .similar-products__heading {
    display: flex;
    align-items: center;
    border: 1px #e5e5e5 solid;
    border-top: none;
    padding: 0.8em 1em;
  }

  .similar-products__table {
    width: 100%;
  }
  .similar-products__table td {
    border: 1px solid;
    text-align: center;
    border: 1px #e5e5e5 solid;
    border-top: none;
    padding: 1em 0.2em;
  }
  .similar-products__table td:last-child {
    border-left: none;
  }

  .similar-products__table-heading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0.7em;
  }
  .similar-products__table-heading img {
    object-fit: cover;
    max-width: 200px;
  }
  /* .similar-products__table-heading span  {
      max-width: 265px;
    } */

  .similar-products__table-blank {
    min-width: 180px;
  }

  .similar-products__table-gray {
    background-color: #f0f2f2;
  }

  .similar-products__table-bordernone {
    border-left: none !important;
    border-right: none !important;
  }
  .similar-products__table-bordernone2 {
    border-right: none !important;
  }

  /* Propositions SECTION  */

  .propositions {
    background-color: #fff;
    border-top: 1px #e5e5e5 solid;
  }

  .propositions__heading {
    display: flex;
    align-items: center;
    border-bottom: 1px #e5e5e5 solid;
    border-top: none;
    padding: 0.8em 0.2em;
  }

  @media (min-width: 700px) {
    .propositions__heading {
      padding: 0.8em 1em;
    }
  }

  .propositions__content {
    border-top: none;
    padding-bottom: 1em;
    padding-top: 2em;
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    padding: 0 0.2em;
  }

  .propositions__box {
    display: flex;
    flex-direction: column;
    border: 1px #e5e5e5 solid;
    border-radius: 10px;
    padding: 1em;
    align-items: center;
    text-align: center;
    margin: 0.5em 0;
    text-decoration: none;
    color: #000;
    transition: scale 0.5s;
  }

  .propositions__box:hover {
    scale: 1.05;
  }
  .propositions__box img {
    width: 235px;
  }

  .similar-products__content {
    overflow: auto;
    white-space: nowrap;
  }

  @media (min-width: 500px) {
    .similar-products {
      display: block;
    }
  }

  @media (min-width: 700px) {
    /* .container {
      padding: 1em;
    } */

    .propositions__box {
      margin: 1em;
    }

    .top-section {
      padding-bottom: 1em;
    }

    .propositions__content {
      grid-template-columns: repeat(2, 1fr);
    }
    .bigPic {
      height: 400px !important;
    }
    .galleryThumb {
      height: 130px !important;
    }
    h3 {
      font-size: 22px;
    }
  }
  @media (min-width: 1000px) {
    .propositions__content {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (min-width: 1300px) {
    .propositions__content {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (min-width: 1100px) {
    .top-section {
      padding-top: 3em;
    }

    .container__top-section {
      flex-direction: row;
      padding-bottom: 0em;
    }
    .product-name {
      display: none;
    }
    .short-description h2 {
      display: inline-block;
    }

    .right-side {
      padding-left: 2em;
    }

    .gallery {
      min-width: 600px;
      min-height: 600px;
    }
    .bigPic {
      height: 500px !important;
    }
  }

  @media (min-width: 720px) {
    .hidden1 {
      display: none;
    }
    .hidden2 {
      display: none;
    }
    .similar-products__content {
      overflow: hidden;
      white-space: unset;
    }
    .similar-products__table-blank {
      min-width: 210px;
    }
  }

  @media (min-width: 1000px) {
    .hidden1 {
      display: table-cell;
    }
    .hidden2 {
      display: none;
    }
  }

  @media (min-width: 1200px) {
    .hidden2 {
      display: table-cell;
    }
  }

  @media (min-width: 1250px) {
    .similar-products__table-blank {
      min-width: 265px;
    }
  }

  /* Product Series */

  .product-series {
    background-color: #fff;
    padding-bottom: 2em;
  }

  .product-series__heading {
    display: flex;
    align-items: center;
    border-top: 1px #e5e5e5 solid;
    border-bottom: 1px #e5e5e5 solid;
    padding: 0.8em 0.2em;
  }

  @media (min-width: 700px) {
    .product-series__heading {
      padding: 0.8em 1em;
    }
  }

  .product-series__content {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    align-items: center;
    margin-top: 1em;
  }
  .product-series__box {
    margin: 0.5em 0.2em;
    background-color: #eaf3fb;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
    justify-content: center;
    text-decoration: none;
    border: 1px #e5e5e5 solid;
  }

  .product-series__box span {
    color: #000;
    font-size: 18px;
    font-weight: 600;
    padding-top: 0.3em;
  }

  @media (min-width: 700px) {
    .product-series__box {
      margin: 1em;
    }
    .section {
      margin: 1.5em 0;
      box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 8px 0px;
      border-radius: 10px;
      border: none;
    }

    .product-series__content {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1000px) {
    .product-series__content {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (min-width: 1300px) {
    .product-series__content {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .specialBorderBottom {
    border-bottom: 1px solid #a6a0a0 !important;
  }
  .specialBorderLeftRight {
    border-right: 1px solid #a6a0a0 !important;
  }

  /* Gallery */

  /**Gallery CSS**/

  .gallery .control-operator:target ~ .controls .control-button {
    color: #ccc;
    color: rgba(255, 255, 255, 0.4);
  }

  .gallery .control-button:first-of-type,
  .gallery
    .control-operator:nth-of-type(1):target
    ~ .controls
    .control-button:nth-of-type(1),
  .gallery
    .control-operator:nth-of-type(2):target
    ~ .controls
    .control-button:nth-of-type(2),
  .gallery
    .control-operator:nth-of-type(3):target
    ~ .controls
    .control-button:nth-of-type(3),
  .gallery
    .control-operator:nth-of-type(4):target
    ~ .controls
    .control-button:nth-of-type(4),
  .gallery
    .control-operator:nth-of-type(5):target
    ~ .controls
    .control-button:nth-of-type(5),
  .gallery
    .control-operator:nth-of-type(6):target
    ~ .controls
    .control-button:nth-of-type(6),
  .gallery
    .control-operator:nth-of-type(7):target
    ~ .controls
    .control-button:nth-of-type(7),
  .gallery
    .control-operator:nth-of-type(8):target
    ~ .controls
    .control-button:nth-of-type(8),
  .gallery
    .control-operator:nth-of-type(9):target
    ~ .controls
    .control-button:nth-of-type(9),
  .gallery
    .control-operator:nth-of-type(10):target
    ~ .controls
    .control-button:nth-of-type(10),
  .gallery
    .control-operator:nth-of-type(11):target
    ~ .controls
    .control-button:nth-of-type(11),
  .gallery
    .control-operator:nth-of-type(12):target
    ~ .controls
    .control-button:nth-of-type(12) {
    color: white;
    color: rgba(255, 255, 255, 0.8);
  }

  .gallery .item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    pointer-events: none;
    opacity: 0;
    -webkit-transition: opacity 0.5s;
    -o-transition: opacity 0.5s;
    transition: opacity 0.5s;
    border-radius: 10px;
  }

  .gallery .control-operator {
    display: none;
  }

  .gallery .control-operator:target ~ .item {
    pointer-events: none;
    opacity: 0;
    -webkit-animation: none;
    -o-animation: none;
    animation: none;
  }

  .gallery .control-operator:target ~ .controls .control-button {
    -webkit-animation: none;
    -o-animation: none;
    animation: none;
  }

  @-webkit-keyframes controlAnimation-2 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    14.3%,
    50% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    64.3%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @-o-keyframes controlAnimation-2 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    14.3%,
    50% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    64.3%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @keyframes controlAnimation-2 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    14.3%,
    50% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    64.3%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @-webkit-keyframes galleryAnimation-2 {
    0% {
      opacity: 0;
    }
    14.3%,
    50% {
      opacity: 1;
    }
    64.3%,
    100% {
      opacity: 0;
    }
  }

  @-o-keyframes galleryAnimation-2 {
    0% {
      opacity: 0;
    }
    14.3%,
    50% {
      opacity: 1;
    }
    64.3%,
    100% {
      opacity: 0;
    }
  }

  @keyframes galleryAnimation-2 {
    0% {
      opacity: 0;
    }
    14.3%,
    50% {
      opacity: 1;
    }
    64.3%,
    100% {
      opacity: 0;
    }
  }

  .gallery .control-operator:nth-of-type(1):target ~ .item:nth-of-type(1) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(2):target ~ .item:nth-of-type(2) {
    pointer-events: auto;
    opacity: 1;
  }

  .items-2.autoplay .control-button {
    -webkit-animation: controlAnimation-2 14s infinite;
    -o-animation: controlAnimation-2 14s infinite;
    animation: controlAnimation-2 14s infinite;
  }

  .items-2.autoplay .item {
    -webkit-animation: galleryAnimation-2 14s infinite;
    -o-animation: galleryAnimation-2 14s infinite;
    animation: galleryAnimation-2 14s infinite;
  }

  .items-2 .control-button:nth-of-type(1),
  .items-2 .item:nth-of-type(1) {
    -webkit-animation-delay: -2s;
    -o-animation-delay: -2s;
    animation-delay: -2s;
  }

  .items-2 .control-button:nth-of-type(2),
  .items-2 .item:nth-of-type(2) {
    -webkit-animation-delay: 5s;
    -o-animation-delay: 5s;
    animation-delay: 5s;
  }

  @-webkit-keyframes controlAnimation-3 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    9.5%,
    33.3% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    42.9%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @-o-keyframes controlAnimation-3 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    9.5%,
    33.3% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    42.9%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @keyframes controlAnimation-3 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    9.5%,
    33.3% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    42.9%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @-webkit-keyframes galleryAnimation-3 {
    0% {
      opacity: 0;
    }
    9.5%,
    33.3% {
      opacity: 1;
    }
    42.9%,
    100% {
      opacity: 0;
    }
  }

  @-o-keyframes galleryAnimation-3 {
    0% {
      opacity: 0;
    }
    9.5%,
    33.3% {
      opacity: 1;
    }
    42.9%,
    100% {
      opacity: 0;
    }
  }

  @keyframes galleryAnimation-3 {
    0% {
      opacity: 0;
    }
    9.5%,
    33.3% {
      opacity: 1;
    }
    42.9%,
    100% {
      opacity: 0;
    }
  }

  .gallery .control-operator:nth-of-type(1):target ~ .item:nth-of-type(1) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(2):target ~ .item:nth-of-type(2) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(3):target ~ .item:nth-of-type(3) {
    pointer-events: auto;
    opacity: 1;
  }

  .items-3.autoplay .control-button {
    -webkit-animation: controlAnimation-3 21s infinite;
    -o-animation: controlAnimation-3 21s infinite;
    animation: controlAnimation-3 21s infinite;
  }

  .items-3.autoplay .item {
    -webkit-animation: galleryAnimation-3 21s infinite;
    -o-animation: galleryAnimation-3 21s infinite;
    animation: galleryAnimation-3 21s infinite;
  }

  .items-3 .control-button:nth-of-type(1),
  .items-3 .item:nth-of-type(1) {
    -webkit-animation-delay: -2s;
    -o-animation-delay: -2s;
    animation-delay: -2s;
  }

  .items-3 .control-button:nth-of-type(2),
  .items-3 .item:nth-of-type(2) {
    -webkit-animation-delay: 5s;
    -o-animation-delay: 5s;
    animation-delay: 5s;
  }

  .items-3 .control-button:nth-of-type(3),
  .items-3 .item:nth-of-type(3) {
    -webkit-animation-delay: 12s;
    -o-animation-delay: 12s;
    animation-delay: 12s;
  }

  @-webkit-keyframes controlAnimation-4 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    7.1%,
    25% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    32.1%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @-o-keyframes controlAnimation-4 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    7.1%,
    25% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    32.1%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @keyframes controlAnimation-4 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    7.1%,
    25% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    32.1%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @-webkit-keyframes galleryAnimation-4 {
    0% {
      opacity: 0;
    }
    7.1%,
    25% {
      opacity: 1;
    }
    32.1%,
    100% {
      opacity: 0;
    }
  }

  @-o-keyframes galleryAnimation-4 {
    0% {
      opacity: 0;
    }
    7.1%,
    25% {
      opacity: 1;
    }
    32.1%,
    100% {
      opacity: 0;
    }
  }

  @keyframes galleryAnimation-4 {
    0% {
      opacity: 0;
    }
    7.1%,
    25% {
      opacity: 1;
    }
    32.1%,
    100% {
      opacity: 0;
    }
  }

  .gallery .control-operator:nth-of-type(1):target ~ .item:nth-of-type(1) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(2):target ~ .item:nth-of-type(2) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(3):target ~ .item:nth-of-type(3) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(4):target ~ .item:nth-of-type(4) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(5):target ~ .item:nth-of-type(5) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(6):target ~ .item:nth-of-type(6) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(7):target ~ .item:nth-of-type(7) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(8):target ~ .item:nth-of-type(8) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(9):target ~ .item:nth-of-type(9) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(10):target ~ .item:nth-of-type(10) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(11):target ~ .item:nth-of-type(11) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(12):target ~ .item:nth-of-type(12) {
    pointer-events: auto;
    opacity: 1;
  }

  .items-4.autoplay .control-button {
    -webkit-animation: controlAnimation-4 28s infinite;
    -o-animation: controlAnimation-4 28s infinite;
    animation: controlAnimation-4 28s infinite;
  }

  .items-4.autoplay .item {
    -webkit-animation: galleryAnimation-4 28s infinite;
    -o-animation: galleryAnimation-4 28s infinite;
    animation: galleryAnimation-4 28s infinite;
  }

  .items-4 .control-button:nth-of-type(1),
  .items-4 .item:nth-of-type(1) {
    -webkit-animation-delay: -2s;
    -o-animation-delay: -2s;
    animation-delay: -2s;
  }

  .items-4 .control-button:nth-of-type(2),
  .items-4 .item:nth-of-type(2) {
    -webkit-animation-delay: 5s;
    -o-animation-delay: 5s;
    animation-delay: 5s;
  }

  .items-4 .control-button:nth-of-type(3),
  .items-4 .item:nth-of-type(3) {
    -webkit-animation-delay: 12s;
    -o-animation-delay: 12s;
    animation-delay: 12s;
  }

  .items-4 .control-button:nth-of-type(4),
  .items-4 .item:nth-of-type(4) {
    -webkit-animation-delay: 19s;
    -o-animation-delay: 19s;
    animation-delay: 19s;
  }

  .items-4 .control-button:nth-of-type(5),
  .items-4 .item:nth-of-type(5) {
    -webkit-animation-delay: 19s;
    -o-animation-delay: 19s;
    animation-delay: 19s;
  }

  @-webkit-keyframes controlAnimation-5 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    5.7%,
    20% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    25.7%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @-o-keyframes controlAnimation-5 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    5.7%,
    20% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    25.7%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @keyframes controlAnimation-5 {
    0% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
    5.7%,
    20% {
      color: white;
      color: rgba(255, 255, 255, 0.8);
    }
    25.7%,
    100% {
      color: #ccc;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  @-webkit-keyframes galleryAnimation-5 {
    0% {
      opacity: 0;
    }
    5.7%,
    20% {
      opacity: 1;
    }
    25.7%,
    100% {
      opacity: 0;
    }
  }

  @-o-keyframes galleryAnimation-5 {
    0% {
      opacity: 0;
    }
    5.7%,
    20% {
      opacity: 1;
    }
    25.7%,
    100% {
      opacity: 0;
    }
  }

  @keyframes galleryAnimation-5 {
    0% {
      opacity: 0;
    }
    5.7%,
    20% {
      opacity: 1;
    }
    25.7%,
    100% {
      opacity: 0;
    }
  }

  .gallery .control-operator:nth-of-type(1):target ~ .item:nth-of-type(1) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(2):target ~ .item:nth-of-type(2) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(3):target ~ .item:nth-of-type(3) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(4):target ~ .item:nth-of-type(4) {
    pointer-events: auto;
    opacity: 1;
  }

  .gallery .control-operator:nth-of-type(5):target ~ .item:nth-of-type(5) {
    pointer-events: auto;
    opacity: 1;
  }

  .items-5.autoplay .control-button {
    -webkit-animation: controlAnimation-5 35s infinite;
    -o-animation: controlAnimation-5 35s infinite;
    animation: controlAnimation-5 35s infinite;
  }

  .items-5.autoplay .item {
    -webkit-animation: galleryAnimation-5 35s infinite;
    -o-animation: galleryAnimation-5 35s infinite;
    animation: galleryAnimation-5 35s infinite;
  }

  .items-5 .control-button:nth-of-type(1),
  .items-5 .item:nth-of-type(1) {
    -webkit-animation-delay: -2s;
    -o-animation-delay: -2s;
    animation-delay: -2s;
  }

  .items-5 .control-button:nth-of-type(2),
  .items-5 .item:nth-of-type(2) {
    -webkit-animation-delay: 5s;
    -o-animation-delay: 5s;
    animation-delay: 5s;
  }

  .items-5 .control-button:nth-of-type(3),
  .items-5 .item:nth-of-type(3) {
    -webkit-animation-delay: 12s;
    -o-animation-delay: 12s;
    animation-delay: 12s;
  }

  .items-5 .control-button:nth-of-type(4),
  .items-5 .item:nth-of-type(4) {
    -webkit-animation-delay: 19s;
    -o-animation-delay: 19s;
    animation-delay: 19s;
  }

  .items-5 .control-button:nth-of-type(5),
  .items-5 .item:nth-of-type(5) {
    -webkit-animation-delay: 26s;
    -o-animation-delay: 26s;
    animation-delay: 26s;
  }

  .gallery .control-button {
    color: #ccc;
    color: rgba(255, 255, 255, 0.4);
  }

  .gallery .control-button:hover {
    color: white;
    color: rgba(255, 255, 255, 0.8);
  }

  .gallery {
    position: relative;
  }

  .gallery .item {
    overflow: hidden;
    text-align: center;
  }

  .gallery .controls {
    width: 100%;
  }

  .gallery .control-button {
    display: inline-block;
    margin: 0 0.02em;
    font-size: 3em;
    text-align: center;
    text-decoration: none;
    -webkit-transition: color 0.1s;
    -o-transition: color 0.1s;
    transition: color 0.1s;
  }

  .gallery .item:first-of-type {
    position: relative;
    pointer-events: auto;
    opacity: 1;
  }

  .gallery {
    width: 100%;
    float: left;
    margin-bottom: 30px;
  }

  .bigPic {
    position: relative;
    width: 100%;
    height: 300px;
    text-align: center;
    margin: 0;
    background-color: #fff;
    border: 1px solid #e7e7e7;
  }

  .bigPic img {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    max-width: 100%;
    max-height: 100%;
  }

  .galleryNav {
    padding-top: 15px;
    padding-left: 0;
    display: flex;
    justify-content: space-between;
  }

  .galleryThumb {
    position: relative;
    display: inline-block;
    margin-right: 1%;
    margin-left: -4px;
    width: 23%;
    height: 90px;
    text-align: center;
    margin-bottom: 5px;
    border: 1px solid #e7e7e7;
    border-radius: 10px;
  }

  .galleryThumb:hover,
  .galleryThumb:visited,
  .galleryThumb:link {
    text-decoration: none;
  }

  .galleryThumb:nth-child(1),
  .galleryThumb:nth-child(5) {
    margin-left: 0;
  }

  .galleryThumb:nth-child(4n) {
    margin-right: 0;
  }

  .galleryThumb:last-child {
    margin-right: 0;
  }

  .galleryThumb:hover {
    opacity: 0.7;
    cursor: pointer;
    transition: all 0.2s;
  }

  .galleryThumb img {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    max-width: 100%;
    max-height: 100%;
  }

  /* 8. Tab Bar */

  .tabContent h1,
  .tabBar h2,
  .tabContent h2,
  .tabBar h2 {
    font-family: "Mulish";
  }

  /* .tabContent {
    clear: both;
    overflow: auto;
  } */

  .tabBar input[type="radio"] {
    visibility: hidden;
    margin: 0;
    padding: 0;
    height: 0;
    width: 0;
    position: absolute;
  }

  .tablinks {
    display: inline-block;
    width: 150px;
    background-color: #eff0eb;
    color: #666666;
    text-align: center;
    text-transform: uppercase;
    font-size: 16px;
    font-family: "Mulish";
    line-height: 40px;
    -webkit-transition: all 0.1s ease-in-out;
    -moz-transition: all 0.1s ease-in-out;
    -o-transition: all 0.1s ease-in-out;
    transition: all 0.1s ease-in-out;
    border: 1px solid #eff0eb;
    position: relative;
  }

  .tablinks:hover {
    border: 1px solid #d6d6d6;
    border-bottom: 1px solid #fff;
    background-color: #fff;
    color: #000;
    cursor: pointer;
  }

  #tab1-btn:checked + .tablinks,
  #tab2-btn:checked + .tablinks,
  #tab3-btn:checked + .tablinks,
  #tab4-btn:checked + .tablinks,
  #tab5-btn:checked + .tablinks,
  #tab6-btn:checked + .tablinks {
    border: 1px solid #d6d6d6;
    border-bottom: 1px solid #fff;
    background-color: #fff;
    color: #000;
    position: relative;
    z-index: 2;
    display: inline-block;
    text-align: center;
    text-transform: uppercase;
    font-size: 16px;
    font-family: "Mulish";
    cursor: pointer;
    border-bottom: 1px solid #fff;
    top: 1px;
  }

  #tab1-btn:checked ~ #tab1 {
    display: block;
  }

  #tab1-btn:checked ~ #tab2,
  #tab1-btn:checked ~ #tab3,
  #tab1-btn:checked ~ #tab4,
  #tab1-btn:checked ~ #tab5,
  #tab1-btn:checked ~ #tab6 {
    display: none;
  }

  #tab2-btn:checked ~ #tab2 {
    display: block;
  }

  #tab2-btn:checked ~ #tab1,
  #tab2-btn:checked ~ #tab3,
  #tab2-btn:checked ~ #tab4,
  #tab2-btn:checked ~ #tab5,
  #tab2-btn:checked ~ #tab6 {
    display: none;
  }

  #tab3-btn:checked ~ #tab3 {
    display: block;
  }

  #tab3-btn:checked ~ #tab1,
  #tab3-btn:checked ~ #tab2,
  #tab3-btn:checked ~ #tab4,
  #tab3-btn:checked ~ #tab5,
  #tab3-btn:checked ~ #tab6 {
    display: none;
  }

  #tab4-btn:checked ~ #tab4 {
    display: block;
  }

  #tab4-btn:checked ~ #tab1,
  #tab4-btn:checked ~ #tab2,
  #tab4-btn:checked ~ #tab3,
  #tab4-btn:checked ~ #tab5,
  #tab4-btn:checked ~ #tab6 {
    display: none;
  }

  #tab5-btn:checked ~ #tab5 {
    display: block;
  }

  #tab5-btn:checked ~ #tab1,
  #tab5-btn:checked ~ #tab2,
  #tab5-btn:checked ~ #tab3,
  #tab5-btn:checked ~ #tab4,
  #tab5-btn:checked ~ #tab6 {
    display: none;
  }

  #tab6-btn:checked ~ #tab6 {
    display: block;
  }

  #tab6-btn:checked ~ #tab1,
  #tab6-btn:checked ~ #tab2,
  #tab6-btn:checked ~ #tab3,
  #tab6-btn:checked ~ #tab4,
  #tab6-btn:checked ~ #tab5 {
    display: none;
  }
  .contentBorder {
    border: 1px solid #d6d6d6;
    padding: 25px 50px 55px 50px;
  }
  h3 strong {
  font-weight: 500;
  }
  .roles p {
  font-size: 14px;
  }
  table td {
    font-size: 14px;
}
    table th {
    font-size: 14px;
}

</style>

    `;
};
