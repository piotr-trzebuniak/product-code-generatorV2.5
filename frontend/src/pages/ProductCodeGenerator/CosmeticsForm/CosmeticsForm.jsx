import React from "react";
import style from "./CosmeticsForm.module.scss";
import BasicInfoCosmetics from "../../../compoments/BasicInfoCosmetics/BasicInfoCosmetics";
import SpecialFeatures from "../../../compoments/SpecialFeatures/SpecialFeatures";
import { ShortDescription } from "../../../compoments/Tiptap/ShortDescription";
import { CosmeticsDesc1 } from "../../../compoments/Tiptap/CosmeticsDesc1";
import { CosmeticsDesc2 } from "../../../compoments/Tiptap/CosmeticsDesc2";
import { CosmeticsDesc3 } from "../../../compoments/Tiptap/CosmeticsDesc3";
import { CosmeticsDesc4 } from "../../../compoments/Tiptap/CosmeticsDesc4";
import Table from "../../../compoments/Table/Table";
import Button from "../../../compoments/Button/Button";
import { TableEnd } from "../../../compoments/Tiptap/TableEnd";
import { useDispatch } from "react-redux";
import { addIngredient, removeIngredient } from "../../../redux/productSlice";
import { CosmeticsDescSplit } from "../../../compoments/Tiptap/CosmeticsDescSplit";
import SelectCategory from "../../../compoments/SelectCategory/SelectCategory";

const CosmeticsForm = ({ resetKey }) => {
  const dispatch = useDispatch();
  const handleAddIngredient = () => {
    dispatch(addIngredient());
  };

  const handleRemoveIngredient = () => {
    dispatch(removeIngredient());
  };

  return (
    <div className={style.cosmetics}>
      <div className={style.cosmetics__grid}>
        <BasicInfoCosmetics />
        <SpecialFeatures />
      </div>

      <ShortDescription onReset={resetKey} />
      <CosmeticsDescSplit />
      <div className={style.cosmetics__columns}>
        <div>
          <CosmeticsDesc1 onReset={resetKey} />
          <CosmeticsDesc2 onReset={resetKey} />
          <CosmeticsDesc3 onReset={resetKey} />
        </div>
        <div>
          <CosmeticsDesc4 onReset={resetKey} />
        </div>
      </div>
      <div>
        <Table />
        <Button onClick={handleAddIngredient}>Dodaj składnik</Button>
        <Button
          className={style.generator__deleteBtn}
          onClick={handleRemoveIngredient}
        >
          Usuń składnik
        </Button>
        <TableEnd />
      </div>
      <div className={style.cosmetics__category}>
        <SelectCategory />
      </div>
    </div>
  );
};

export default CosmeticsForm;
