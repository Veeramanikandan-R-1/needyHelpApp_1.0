import React from 'react'
import "./index.scss";

const CustomButton = ({ buttonText, children, variant, fullWidth, className = '', ...props }) => {
  const classes = ['button-container'];
  if (variant === 'ghost') classes.push('ghost');
  if (fullWidth) classes.push('full');
  if (className) classes.push(className);
  return (
    <button className={classes.join(' ')} {...props}>
        {buttonText ?? children}
    </button>
  )
}

export default CustomButton