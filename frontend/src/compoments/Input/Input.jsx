import React from 'react'
import style from './Input.module.scss'

const Input = ({className, name, placeholder, value, onChange, readOnly}) => {
  const classNames = `${className} ${style.input}`

  return (
    <input 
      className={classNames} 
      name={name} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange}
      readOnly={readOnly} 
    />
  )
}

export default Input