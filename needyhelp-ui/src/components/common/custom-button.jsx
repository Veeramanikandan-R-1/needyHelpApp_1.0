import React from 'react'
import "./index.scss";

const CustomButton = ({buttonText,...props}) => {
  return (
    <button className='button-container' {...props}>
        {buttonText}
    </button>
  )
}

export default CustomButton