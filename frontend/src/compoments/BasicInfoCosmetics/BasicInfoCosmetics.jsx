import React from 'react'
import style from "./BasicInfoCosmetics.module.scss"
import Input from '../Input/Input'
import { useDispatch, useSelector } from 'react-redux'
import { updateProduct } from '../../redux/productSlice'


const BasicInfoCosmetics = () => {
  const productData = useSelector((state) => state.product.product)
  const dispatch = useDispatch()

  return (
    <div className={style.basicInfo}>
    <h3>Podstawowe informacje</h3>
    <Input
      placeholder="SKU"
      value={productData.productSku}
      onChange={(e) => {
        dispatch(updateProduct({ productSku: e.target.value }));
      }}
    />
      <Input
        placeholder="Nazwa produktu"
        value={productData.productName?.pl || ""}
        onChange={(e) => {
          dispatch(updateProduct({ 
            productName: {
              ...productData.productName,
              pl: e.target.value
            }
          }));
        }}
      />
          <div className={style.basicInfo__grid}>
        <span>Porcja jednorazowa:</span>
        <Input
          placeholder="Porcja jednorazowa (ilość)"
          value={productData.portion.portionAmount}
          onChange={(e) =>
            dispatch(
              updateProduct({
                portion: {
                  ...productData.portion,
                  portionAmount: e.target.value,
                },
                portionQuantity: (
                  productData.size.sizeAmount / e.target.value
                ).toFixed(0),
              })
            )
          }
        />
        <Input
          placeholder="Jednostka/typ"
          value={productData.portion.unit.pl}
          onChange={(e) =>
            dispatch(
              updateProduct({
                portion: { ...productData.portion, unit: { pl: e.target.value, en: "", de: "" } },
              })
            )
          }
        />
      </div>
  </div>
  )
}

export default BasicInfoCosmetics