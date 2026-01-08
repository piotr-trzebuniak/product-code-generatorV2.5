import React from "react";
import Select from "react-select";
import { categories } from "./categories";
import { useDispatch } from "react-redux";
import { updateProduct } from "../../redux/productSlice";


const SelectCategory = () => {

  const dispatch = useDispatch()

  const handleChange = (selectedOption) => {
    dispatch(updateProduct({ categoryID: selectedOption.value}));
  };

  return (
    <Select
      options={categories}
      onChange={handleChange}
      placeholder="Wybierz kategorie..."
    />
  );
};

export default SelectCategory;
