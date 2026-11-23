import {useState, useRef} from 'preact/hooks'

const Draggable = ({children, onChange, ...rest}) => {
  const ref = useRef({startY: 0})
  const [position, setPosition] = useState({})
  const handleDrag = event => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    ref.current.startY = event.clientY
  }
  const handleMove = event => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }
    const y = event.clientY - ref.current.startY
    onChange?.(event, {y})
    setPosition({y})
  }
  const handleEnd = event => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    onChange?.(event, {y: position.y, state: 'end'})
    setPosition({y: 0})
  }

  return (
    <div
      style={
        Number.isFinite(position.y)
          ? {transform: `translateY(${position.y}px)`}
          : {}
      }
      onPointerDown={handleDrag}
      onPointerMove={handleMove}
      onPointerUp={handleEnd}
      {...rest} 
    >
      {children}
    </div>
  )
}

export default Draggable
