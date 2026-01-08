import React, { useState } from "react";
import Select from "react-select";
import { ingredients } from "./ingredientsRws";
import Input from "../Input/Input";
import style from "./RwsCalc.module.scss";

const RwsCalc = () => {
  const [amount, setAmount] = useState(""); // Przechowujemy wartość jako string
  const [rws, setRws] = useState(""); // Wynik także jako string dla lepszej obsługi pustych wartości
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const calculateRws = (amountValue, ingredientValue) => {
    if (amountValue && ingredientValue) {
      const result = ((amountValue / ingredientValue) * 100).toFixed(2); // Wynik z dwoma miejscami po przecinku
      setRws(result);
    } else {
      setRws(""); // Jeśli brakuje danych, wynik pozostaje pusty
    }

  };

  const handleAmountChange = (e) => {
    let value = e.target.value;

    // Zamieniamy przecinek na kropkę
    value = value.replace(",", ".");

    // Walidacja: tylko liczby i kropki
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value); // Aktualizujemy wartość
      calculateRws(parseFloat(value), selectedIngredient?.value); // Obliczamy RWS, jeśli możliwe
    }
  };

  const handleChange = (selectedOption) => {
    console.log(selectedOption.value)
    setSelectedIngredient(selectedOption);
    calculateRws(parseFloat(amount.replace(",", ".")), selectedOption?.value); // Obliczenia z zamianą przecinka na kropkę

  };

  return (
    <div className={style.rws}>
      <h4>Kalkulator RWS</h4>
      <div className={style.rws__grid}>
        <Input
          placeholder="Ilość"
          value={amount}
          onChange={handleAmountChange} // Obsługa zmiany ilości
        />
        <Select
          options={ingredients}
          onChange={handleChange} // Obsługa zmiany składnika
          placeholder="Wybierz składnik..."
        />
        <Input
          placeholder="RWS %"
          value={rws} // Pole wynikowe
          readOnly
        />
      </div>
    </div>
  );
};

export default RwsCalc;
