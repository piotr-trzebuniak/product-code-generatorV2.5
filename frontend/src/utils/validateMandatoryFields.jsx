export const validateMandatoryFields = (productData, productType) => {
    // Funkcja pomocnicza do sprawdzania, czy pole zawierające HTML jest faktycznie puste
    const isHtmlEmpty = (value) => {
      if (!value) return true;
      
      // Usuń wszystkie znaczniki HTML
      const textOnly = value.replace(/<[^>]*>/g, '');
      
      // Sprawdź, czy pozostała treść jest pusta (lub składa się tylko z białych znaków)
      return textOnly.trim() === '';
    };
    
    // Funkcja sprawdzająca czy wartość pola jest pusta, uwzględniając znaczniki HTML i struktury obiektów
    const isFieldEmpty = (value) => {
      // Sprawdzenie wartości pustych
      if (value === undefined || value === null || value === '') return true;
      
      // Jeśli wartość jest stringiem, sprawdź czy to nie są tylko puste znaczniki HTML
      if (typeof value === 'string') {
        return isHtmlEmpty(value);
      }
      
      // Jeśli wartość jest obiektem, sprawdź rekurencyjnie wszystkie jego pola
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Jeśli to pusty obiekt, traktuj jako pusty
        if (Object.keys(value).length === 0) return true;
        
        // Sprawdź, czy wszystkie pola obiektu są puste (rekurencyjnie)
        // Jeśli wszystkie pola są puste, traktuj cały obiekt jako pusty
        return Object.values(value).every(fieldValue => isFieldEmpty(fieldValue));
      }
      
      // Dla tablic sprawdź, czy tablica jest pusta lub czy wszystkie jej elementy są puste
      if (Array.isArray(value)) {
        if (value.length === 0) return true;
        return value.every(item => isFieldEmpty(item));
      }
      
      // Dla pozostałych typów (liczby, wartości logiczne itp.) zwróć false - nie są puste
      return false;
    };
  
    // Sprawdzenie czy mamy poprawną strukturę danych
    if (!productData || typeof productData !== 'object') {
      return {
        isValid: false,
        missingFields: ['Nieprawidłowa struktura danych produktu']
      };
    }
    
    // Inicjalizacja pustego obiektu dla pól obowiązkowych
    const mandatoryFields = {};
    
    // Określenie pól obowiązkowych w zależności od typu produktu
    if (productType === "supplements") {
      Object.assign(mandatoryFields, {
        productSku: 'SKU produktu',
        'productName.pl': 'Nazwa produktu',
        categoryID: 'Kategoria EBAY', // ← NOWE POLE DODANE
        'size.sizeAmount': 'Wielkość opakowania',
        'size.unit.pl': 'Jednostka opakowania',
        'portion.portionAmount': 'Wielkość porcji',
        'portion.unit.pl': 'Jednostka porcji',
        portionQuantity: 'Ilość porcji',
        'ingredientsTable[0].ingredient.pl': 'Tabela wartości odżywczych',
        'shortDescription.pl': 'Krótki opis',
        'ingredients.pl': 'Składniki',
        'howToUse.pl': 'Sposób użycia',
        'bulletpoints.pl': 'Dlaczego warto stosować?',
        'contraindications.pl': 'Przeciwwskazania',
        'storage.pl': 'Przechowywanie',
        'additionalInformation.pl': 'Dodatkowe informacje',
        'tableEnd.pl': 'Informacja końcowa tabeli'
      });
    } else if (productType === "cosmetics") {
      Object.assign(mandatoryFields, {
        productSku: 'SKU produktu',
        'productName.pl': 'Nazwa produktu',
        categoryID: 'Kategoria EBAY', // ← NOWE POLE DODANE
        'shortDescription.pl': 'Krótki opis',
        'cosmeticsDescription1.pl': 'Opis kosmetyku 1',
        'cosmeticsDescription2.pl': 'Opis kosmetyku 2',
        'cosmeticsDescription3.pl': 'Opis kosmetyku 3',
        'cosmeticsDescription4.pl': 'Opis kosmetyku 4'
      });
    } else {
      // Obsługa nieznanych typów produktów
      return {
        isValid: false,
        missingFields: [`Nieobsługiwany typ produktu: ${productType}`]
      };
    }
    
    // Sprawdź, które pola są puste
    const missingFields = [];
    
    for (const [fieldPath, label] of Object.entries(mandatoryFields)) {
      // Obsługa zagnieżdżonych ścieżek i tablic
      const fieldParts = fieldPath.split('.');
      let currentObj = productData;
      let isValid = true;
      
      // Specjalna obsługa dla pól tablicowych (np. ingredientsTable[0])
      for (let i = 0; i < fieldParts.length; i++) {
        const part = fieldParts[i];
        
        // Obsługa indeksów tablic, np. ingredientsTable[0]
        if (part.includes('[') && part.includes(']')) {
          const arrayName = part.substring(0, part.indexOf('['));
          const arrayIndex = parseInt(part.substring(part.indexOf('[') + 1, part.indexOf(']')));
          
          if (!currentObj[arrayName] || !Array.isArray(currentObj[arrayName]) || 
              currentObj[arrayName].length <= arrayIndex) {
            isValid = false;
            break;
          }
          
          currentObj = currentObj[arrayName][arrayIndex];
        } else {
          // Standardowa obsługa dla zagnieżdżonych obiektów
          if (!currentObj || currentObj[part] === undefined) {
            isValid = false;
            break;
          }
          
          currentObj = currentObj[part];
        }
      }
      
      // Sprawdź czy wartość końcowa istnieje i nie jest pusta (uwzględniając puste znaczniki HTML i struktury obiektów)
      if (!isValid || isFieldEmpty(currentObj)) {
        missingFields.push(label);
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields
    };
  };