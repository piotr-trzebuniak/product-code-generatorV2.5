import React, { useState } from "react";
import style from "./Table.module.scss";
import Input from "../Input/Input";
import { useDispatch, useSelector } from "react-redux";
import { removeIngredient, updateProduct } from "../../redux/productSlice";
import deleteIcon from "../../assets/delete-button.png";
import addIcon from "../../assets/add-button.png";

const Table = () => {
  const dispatch = useDispatch();
  const ingredientsTable = useSelector(
    (state) => state.product.product.ingredientsTable
  );
  const portion = useSelector((state) => state.product.product.portion);

  // Pomocnicza funkcja do sprawdzania i obsługi wartości
  const getInputValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return value.pl || "";
    return value;
  };
  
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = ingredientsTable.map((ingredient, i) => {
      if (i === index) {
        if (["ingredient", "ingredientValue"].includes(field)) {
          return {
            ...ingredient,
            [field]: {
              ...ingredient[field],
              pl: value,
            },
          };
        }
  
        return { ...ingredient, [field]: value };
      }
      return ingredient;
    });
    dispatch(updateProduct({ ingredientsTable: updatedIngredients }));
  };
  

  const handlePortionChange = (e) => {
    dispatch(updateProduct({ portion: e.target.value }));
  };

  const handleRemoveIngredient = (index) => {
    dispatch(removeIngredient(index));
  };

  const handleAdditionalLineChange = (
    ingredientIndex,
    lineIndex,
    field,
    value
  ) => {
    const updatedIngredients = ingredientsTable.map((ingredient, i) => {
      if (i === ingredientIndex) {
        const updatedLines = ingredient.additionalLines.map((line, li) => {
          if (li === lineIndex) {
            if (["ingredient", "ingredientValue"].includes(field)) {
              return {
                ...line,
                [field]: {
                  ...line[field],
                  pl: value,
                },
              };
            }
            return {
              ...line,
              [field]: value,
            };
          }
          return line;
        });
        return { ...ingredient, additionalLines: updatedLines };
      }
      return ingredient;
    });
    dispatch(updateProduct({ ingredientsTable: updatedIngredients }));
  };

  const handleAddLine = (ingredientIndex) => {
    const updatedIngredients = ingredientsTable.map((ingredient, i) =>
      i === ingredientIndex
        ? {
            ...ingredient,
            additionalLines: [
              ...ingredient.additionalLines,
              {
                lineIndex: ingredient.additionalLines.length + 1,
                ingredient: { pl: "", en: "", de: "" },
                ingredientValue: { pl: "", en: "", de: "" }, // ✅ poprawione
                rws: "",
              },
            ],
          }
        : ingredient
    );
    dispatch(updateProduct({ ingredientsTable: updatedIngredients }));
  };

  const handleRemoveLine = (ingredientIndex, lineIndex) => {
    const updatedIngredients = ingredientsTable.map((ingredient, i) =>
      i === ingredientIndex
        ? {
            ...ingredient,
            additionalLines: ingredient.additionalLines.filter(
              (_, li) => li !== lineIndex
            ),
          }
        : ingredient
    );
    dispatch(updateProduct({ ingredientsTable: updatedIngredients }));
  };

  return (
    <div className={style.table}>
      <h4>Tabela wartości odżywczych</h4>
      <div className={style.table__tableHeadings}>
        <Input value="Składniki" readOnly />
        <Input
          placeholder="Wielkość porcji"
          value={`${portion?.portionAmount || ""} ${portion?.unit.pl || ""}`}
          onChange={handlePortionChange}
        />
        <Input value="RWS" readOnly />
      </div>

      {ingredientsTable.map((ingredient, ingredientIndex) => (
        <div
          key={ingredient.ingredientIndex}
          className={style.table__ingredient}
        >
          <div className={style["table__ingredient-row"]}>
            <Input
              placeholder={`Składnik ${ingredient.ingredientIndex}`}
              value={ingredient.ingredient?.pl || ""}
              onChange={(e) =>
                handleIngredientChange(
                  ingredientIndex,
                  "ingredient",
                  e.target.value
                )
              }
              className={style["table__ingredient-bold"]}
            />
            <Input
              value={getInputValue(ingredient.ingredientValue)}
              onChange={(e) =>
                handleIngredientChange(
                  ingredientIndex,
                  "ingredientValue",
                  e.target.value
                )
              }
            />
            <Input
              value={ingredient.rws || ""}
              onChange={(e) =>
                handleIngredientChange(ingredientIndex, "rws", e.target.value)
              }
            />
            <img
              className={style["table__ingredient-add"]}
              src={addIcon}
              alt=""
              onClick={() => handleAddLine(ingredientIndex)}
            />
          </div>

          {ingredient.additionalLines &&
            Array.isArray(ingredient.additionalLines) &&
            ingredient.additionalLines.map((line, lineIndex) => (
              <div
                key={line.lineIndex}
                className={style["table__ingredient-row"]}
              >
                <Input
                  placeholder={`Dodatkowa linia ${line.lineIndex}`}
                  value={line.ingredient?.pl || ""}
                  onChange={(e) =>
                    handleAdditionalLineChange(
                      ingredientIndex,
                      lineIndex,
                      "ingredient",
                      e.target.value
                    )
                  }
                />
                <Input
                  value={line.ingredientValue?.pl || ""}
                  onChange={(e) =>
                    handleAdditionalLineChange(
                      ingredientIndex,
                      lineIndex,
                      "ingredientValue",
                      e.target.value
                    )
                  }
                />

                <Input
                  value={line.rws || ""}
                  onChange={(e) =>
                    handleAdditionalLineChange(
                      ingredientIndex,
                      lineIndex,
                      "rws",
                      e.target.value
                    )
                  }
                />
                <img
                  className={style["table__ingredient-delete"]}
                  src={deleteIcon}
                  alt=""
                  onClick={() => handleRemoveLine(ingredientIndex, lineIndex)}
                />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default Table;
