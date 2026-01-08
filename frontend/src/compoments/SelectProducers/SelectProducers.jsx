import React from "react";
import Select from "react-select";
import { producers } from "./producers";
import { useDispatch } from "react-redux";
import { updateProduct } from "../../redux/productSlice";


const SelectProducers = () => {

  const dispatch = useDispatch()

  const handleChange = (selectedOption) => {
    dispatch(updateProduct({ producer: { shop: selectedOption.value.shop, bl: selectedOption.value.bl } }));
  };

  return (
    <Select
      options={producers}
      onChange={handleChange}
      placeholder="Wybierz producenta..."
    />
  );
};

export default SelectProducers;
