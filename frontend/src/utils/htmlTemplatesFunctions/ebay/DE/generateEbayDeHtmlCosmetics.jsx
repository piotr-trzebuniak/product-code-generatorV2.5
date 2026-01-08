import { featuresMapDE } from "../../../featureMaps/featuresMapDE";
import { removeTrailingBracketAndDots } from "../EN/generateEbayEnHtmlCosmetics";

export const ingredientTableHtmlToShop = (ingredientsTable) => {
  return ingredientsTable
    .map((ingredient) => {
      // Podstawowy składnik
      let ingredientName = `<strong>${
        ingredient.ingredient?.de || ""
      }</strong>`;
      let ingredientValue = ingredient.ingredientValue?.de || ""; // Sprawdzamy, czy ingredientValue ma właściwość 'pl'
      let ingredientRws = ingredient.rws ? `${ingredient.rws}` : "";

      // Jeśli ingredientValue jest obiektem, wyciągamy wartość z 'pl'
      if (
        typeof ingredient.ingredientValue === "object" &&
        ingredient.ingredientValue.de
      ) {
        ingredientValue = ingredient.ingredientValue.de; // Wyciągamyy wartość 'pl'
      }

      // Dodatkowe linie składnika
      if (ingredient.additionalLines && ingredient.additionalLines.length > 0) {
        ingredient.additionalLines.forEach((line) => {
          ingredientName += `<br>${line.ingredient?.de || ""}`;

          // Obsługuje przypadek, gdy line.ingredientValue jest obiektem
          let additionalIngredientValue = line.ingredientValue?.de || "";
          if (
            typeof line.ingredientValue === "object" &&
            line.ingredientValue.de
          ) {
            additionalIngredientValue = line.ingredientValue.de;
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
  const pattern =
    /<h3><strong>(Inhaltsstoffe|Zutaten):<\/strong><\/h3><p>([^<]*)<\/p>/i;

  // Szukaj dopasowania
  const match = htmlString.match(pattern);

  if (!match) {
    console.log('Nie znaleziono nagłówka "Inhaltsstoffe:" lub składników');
    return {
      extractedText: "",
      modifiedHtml: htmlString,
    };
  }

  // Wyekstrahowany tekst składników (grupa 2 z wyrażenia regularnego)
  const extractedText = match[2].trim();

  // Usuń cały znaleziony fragment z HTML
  const modifiedHtml = htmlString.replace(match[0], "");

  return {
    extractedText: extractedText,
    modifiedHtml: modifiedHtml,
  };
}

export const generateRoleHtml = (htmlString) => {
  const ICON_URL = "https://elektropak.pl/ebay/role-icon.png";
  
  // Zidentyfikuj nagłówek
  const headerMatch = htmlString.match(/<h3><strong>(.*?)<\/strong><\/h3>/);
  const headerText = headerMatch ? headerMatch[1] : "";
  
  if (!headerMatch) {
    return htmlString;
  }
  
  // Poprawiony regex - elastyczny co do spacji wokół myślnika
  const bulletpoints = [...htmlString.matchAll(/<li><strong>(.*?)<\/strong>\s*-\s*(.*?)<\/li>/g)].map(
    (match) => ({
      title: match[1].trim(),
      description: match[2].trim()
    })
  );
  
  // Generowanie HTML
  const headerHtml = headerText ? `<h3><strong>${headerText}</strong></h3>` : '';
    
  const listHtml = bulletpoints
    .map(
      ({ title, description }) => `
        <div class="role">
          <img src="${ICON_URL}" alt="" />
          <span><strong>${title}</strong> - ${description}</span>
        </div>`
    )
    .join("");
  
  return headerHtml + listHtml;
};

export const generateFeatureHtml = (specialFeatures, featuresMapDE) => {
  const ICON_BASE_URL = "https://elektropak.pl/ebay/icons/";

  const enabledFeatures = Object.entries(specialFeatures).filter(
    ([key, value]) => value && featuresMapDE[key]
  );

  if (enabledFeatures.length === 0) {
    return "";
  }

  return enabledFeatures
    .map(
      ([key]) => `
        <div class="property">
          <img
            src="${ICON_BASE_URL}${featuresMapDE[key].icon}"
            alt=""
            srcset=""
          />
          <span>${featuresMapDE[key].label}</span>
        </div>`
    )
    .join("");
};

export const generateEbayDeHtmlCosmetics = (productData) => {
  if (
    !productData ||
    !productData.ingredientsTable ||
    !Array.isArray(productData.ingredientsTable)
  ) {
    console.error("ingredientsTable is missing or not an array");
    return ""; // Zwracamy pusty string, jeśli ingredientsTable jest niewłaściwe
  }

  const editedCosmeticsDescription4 = extractIngredientsAndRemove(
    productData.cosmeticsDescription4.de
  );

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
          href="https://www.ebay.de/str/medpaksupplements?_tab=feedback"
          >Verkäuferbewertung</a
        >
        <a
          for="tab2-btn"
          class="header__nav-item"
          href="https://www.ebay.de/str/medpaksupplements"
        >
          Alle Artikel</a
        >
        <a
          for="tab4-btn"
          class="header__nav-item"
          href="https://www.ebay.de/str/medpaksupplements?_tab=about"
          >Über Uns</a
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
              <h2>${productData.productName.de}</h2>
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
                <h2>${productData.productName.de}</h2>
                ${removeTrailingBracketAndDots(productData.shortDescription.de)}
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
                ${generateRoleHtml(productData.cosmeticsDescription3.de)}
              </div>
              </div>
              <div class="properties">
                ${generateFeatureHtml(
                  productData.specialFeatures,
                  featuresMapDE
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
                <h4 class="section-heading">Beschreibung</h4>
              </div>
              <div class="description__content">
            
                <div class="row">
                  <div class="col-md-6">
                    <div class="left-column">
                    ${removeTrailingBracketAndDots(
                      productData.cosmeticsDescription1.de
                    )}
                    <br>
                    ${removeTrailingBracketAndDots(
                      productData.cosmeticsDescription2.de
                    )}
                     ${
                       productData.ingredientsTable[0].ingredient.de !== ""
                         ? `
            <div class="table-responsive">
              <table class="table table-hover">
              <thead class="table-lighter">
                <tr>
                  <th>Zutaten</th>
                  <th>${productData.portion.portionAmount} ${productData.portion.unit.de}</th>
                  <th>RM</th>
                </tr>
              </thead>
              <tbody>
                ${ingredientsHTML}
              </tbody>
              </table>
            </div>
            ${productData.tableEnd.de}
                      `
                         : ""
                     }

                     
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="right-column">
                      ${removeTrailingBracketAndDots(
                        editedCosmeticsDescription4.modifiedHtml
                      )}
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
            ${
              editedCosmeticsDescription4.extractedText
                ? `
            <a name="researches"></a>
            <div id="researches" class="researches section">
              <div class="researches__heading">
                <img
                  src="https://elektropak.pl/ebay/heading-icons/researches-heading-icon.png"
                  alt=""
                />
                <h4 class="section-heading">Inhaltsstoffe</h4>
              </div>
              <p>${editedCosmeticsDescription4.extractedText}</p>
            </div>`
                : ""
            }
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
                <h4 class="section-heading">Unsere Produktserie</h4>
              </div>
              <div class="product-series__content">
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=36534928016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria8.png"
                    alt=""
                  />
                  <span>Aromatherapie</span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257246016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria2.png"
                    alt=""
                  />
                  <span>Pflanzliche Ergänzungen</span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257247016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria3.png"
                    alt=""
                  />
                  <span>Die Gesundheit der Kinder</span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257248016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria4.png"
                    alt=""
                  />
                  <span>Vitamine</span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=36534927016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria5.png"
                    alt=""
                  />
                  <span>Nahrungsergänzungen</span>

                  <span></span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257249016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria6.png"
                    alt=""
                  />
                  <span>Sex und Verhütung</span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257250016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria7.png"
                    alt=""
                  />
                  <span>Protein-Ergänzungen</span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257297016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria8.png"
                    alt=""
                  />
                  <span>Immunsystem</span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257298016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria9.png"
                    alt=""
                  />
                  <span>Kosmetika</span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257299016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria10.png"
                    alt=""
                  />
                  <span>Gesunde Ernährung</span>
                </a>
                <a href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257300016" class="product-series__box">
                  <img
                    src="https://elektropak.pl/ebay/series/seria11.png"
                    alt=""
                  />
                  <span>Kräuter und Mischungen</span>
                </a>
                <a
                  href="https://www.ebay.de/str/medpaksupplements/Dietary-Supplements/_i.html?store_cat=44257301016"
                  class="product-series__box"
                >
                  <img
                    src="https://elektropak.pl/ebay/series/seria12.png"
                    alt=""
                  />
                  <span>Gelenke und Knochen</span>
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

    `;
};
