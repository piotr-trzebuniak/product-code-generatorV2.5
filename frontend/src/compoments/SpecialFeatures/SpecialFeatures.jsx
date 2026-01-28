import { useDispatch, useSelector } from "react-redux";
import style from "./SpecialFeatures.module.scss";
import { updateProduct } from "../../redux/productSlice";

const SpecialFeatures = () => {
  const dispatch = useDispatch();
  const specialFeatures = useSelector(
    (state) => state.product.product.specialFeatures
  );


  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    dispatch(
      updateProduct({
        specialFeatures: {
          ...specialFeatures,
          [name]: checked,
        },
      })
    );
  };

  return (
    <div className={style.specialFeatures}>
      <h3>Cechy specjalne</h3>
      <div className={style.specialFeatures__checkboxes}>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="gmoFree"
            checked={specialFeatures.gmoFree}
            onChange={handleCheckboxChange}
          />
          <span>Bez GMO</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="sugarFree"
            checked={specialFeatures.sugarFree}
            onChange={handleCheckboxChange}
          />
          <span>Bez dodatku cukru</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="glutenFree"
            checked={specialFeatures.glutenFree}
            onChange={handleCheckboxChange}
          />
          <span>Bez glutenu</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="lactoseFree"
            checked={specialFeatures.lactoseFree}
            onChange={handleCheckboxChange}
          />
          <span>Bez laktozy</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="soyaFree"
            checked={specialFeatures.soyaFree}
            onChange={handleCheckboxChange}
          />
          <span>Bez soi</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="fillersFree"
            checked={specialFeatures.fillersFree}
            onChange={handleCheckboxChange}
          />
          <span>Bez konserwantów</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="crueltyFree"
            checked={specialFeatures.crueltyFree}
            onChange={handleCheckboxChange}
          />
          <span>Cruelty free</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="hipoalergic"
            checked={specialFeatures.hipoalergic}
            onChange={handleCheckboxChange}
          />
          <span>Hipoalergiczny</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="ketoFriendly"
            checked={specialFeatures.ketoFriendly}
            onChange={handleCheckboxChange}
          />
          <span>Keto Friendly</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="lowCarb"
            checked={specialFeatures.lowCarb}
            onChange={handleCheckboxChange}
          />
          <span>Low Carb</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="slowRelease"
            checked={specialFeatures.slowRelease}
            onChange={handleCheckboxChange}
          />
          <span>Powolne uwalnianie</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="fastRelease"
            checked={specialFeatures.fastRelease}
            onChange={handleCheckboxChange}
          />
          <span>Szybkie uwalnianie</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="filmCoatedTablet"
            checked={specialFeatures.filmCoatedTablet}
            onChange={handleCheckboxChange}
          />
          <span>Tabletka powlekana</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="wegan"
            checked={specialFeatures.wegan}
            onChange={handleCheckboxChange}
          />
          <span>Wegański</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="wegetarian"
            checked={specialFeatures.wegetarian}
            onChange={handleCheckboxChange}
          />
          <span>Wegetariański</span>
        </div>
        <div className={style.specialFeatures__checkbox}>
          <input
            type="checkbox"
            name="zeroWaste"
            checked={specialFeatures.zeroWaste}
            onChange={handleCheckboxChange}
          />
          <span>Zero Waste</span>
        </div>
      </div>
    </div>
  );
};

export default SpecialFeatures;
