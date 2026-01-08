import style from './Button.module.scss'

const Button = ({children, type, onClick, className}) => {

  const classNames = `${style.button} ${className}`

  return (
    <button className={classNames} type={type} onClick={onClick}>{children}</button>
  )
}

export default Button