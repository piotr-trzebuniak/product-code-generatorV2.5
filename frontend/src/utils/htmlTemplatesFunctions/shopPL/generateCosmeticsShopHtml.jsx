import { ingredientTableHtmlToShop } from "./generateShopHtml";

// Funkcja generująca HTML dla sklepu
export const generateCosmeticsShopHtml = (productData) => {
    const tableHtmlToShop = ingredientTableHtmlToShop(productData.ingredientsTable); // Przygotowanie HTML dla składników
  
    const newHtmlToShop = `
  <div class="row">
    <div class="col-md-6">
      <div class="left-column">
        ${productData.cosmeticsDescription1.pl}
        ${productData.cosmeticsDescription2.pl}
        ${productData.cosmeticsDescription3.pl}
      </div>
    </div>
    <div class="col-md-6">
      <div class="right-column">
        ${productData.ingredientsTable[0].ingredient.pl !== "" ? `
        <h3>Wartości odżywcze:</h3> 
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-lighter">
              <tr>
                <th>Składniki</th>
                <th>${productData.portion.portionAmount} ${productData.portion.unit.pl}</th>
                <th>RWS</th>
              </tr>
            </thead>
            <tbody>
              ${tableHtmlToShop}
            </tbody>
          </table>
        </div>
        ${productData.tableEnd.pl}
        ` : ""}
        ${productData.cosmeticsDescription4.pl}
      </div>
    </div>
  </div>`;
  
    return newHtmlToShop;
  };
  