import React from 'react'

const CustomModal = (props) => {
  return (
    <div>
      {props.showModal ? props.children : null}
      {/* {props.children} */}
    </div>
  )
}

export default CustomModal
