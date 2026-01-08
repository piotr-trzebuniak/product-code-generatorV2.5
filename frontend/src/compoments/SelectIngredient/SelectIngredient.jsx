import React from "react";
import Select from "react-select";
import { ingredients } from "./ingredients";
import { useDispatch } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import { research } from "./research";
import { toast } from "react-toastify";


const SelectIngredient = () => {

  const dispatch = useDispatch()

  function arrayToUnorderedList(dataArray) {
    // Tworzymy listę UL i dodajemy każdy element tablicy jako LI
    const listItems = dataArray.map(item => `<li>${item}</li>`).join("");
    
    // Zwracamy całą listę jako jeden ciąg znaków HTML
    return `<ul>${listItems}</ul>`;
  }

  const handleChange = (selectedOption) => {



    
    const bulletList = arrayToUnorderedList(selectedOption.value.bulletpoints)
    dispatch(updateProduct({ bulletpoints: { pl: bulletList, en: "", de: "" } }));

    const selectedIndex = selectedOption.index;

    // Szukamy składnika, którego index pasuje
    const matchingResearch = Object.values(research).find(
      (item) => item.index === selectedIndex
    );
  
    if (matchingResearch) {
      dispatch(updateProduct({ research: matchingResearch }));
      console.log(matchingResearch)
    } else {
      toast.warn(`Nie znaleziono danych research dla indexu: ${selectedIndex}`);
      dispatch(updateProduct({ research: {} }));
    }

  };

  return (
    <Select
      options={ingredients}
      onChange={handleChange}
      placeholder="Wybierz składnik..."
    />
  );
};

export default SelectIngredient;
