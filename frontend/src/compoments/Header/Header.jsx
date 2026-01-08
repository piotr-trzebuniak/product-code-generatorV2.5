import React from "react";
import style from './Header.module.scss'
import Button from "../Button/Button";

export const Header = () => {
  return (
    <div className={style.header}>
      <h2>Medpak Code Generator</h2>
      <Button onClick={onClick}>Suplementy diety</Button>
      <Button onClick={onClick}>Kosmetyki/inne</Button>
    </div>
  );
};
