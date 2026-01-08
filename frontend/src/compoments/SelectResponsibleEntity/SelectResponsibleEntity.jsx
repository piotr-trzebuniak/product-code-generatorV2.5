import React from "react";
import Select from "react-select";
import { responsibleEntity } from "./responsibleEntity";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";


const SelectResponsibleEntity = () => {

  const dispatch = useDispatch()
  const productData = useSelector((state) => state.product.product);


  const handleChange = (selectedOption) => {
    dispatch(updateProduct({ responsibleEntity: { shop: selectedOption.value.shop, bl: selectedOption.value.bl } }));
  };

  return (
    <Select
      options={responsibleEntity}
      onChange={handleChange}
      placeholder="Wybierz podmiot odpowiedzialny..."
    />
  );
};

export default SelectResponsibleEntity;
