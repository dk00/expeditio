import {css} from '@emotion/css'
import {useRef, useState} from 'preact/hooks'
import EventCard from './EventCard'

const round10 = num => Math.round(num / 10) * 10

const getTimePosition = element => {
  const items = Array.from(element.childNodes)
    .filter(item => item.getAttribute?.('data-date'))
    .map(item => ({
      date: Number.parseInt(item.getAttribute('data-date'), 10),
      top: item.offsetTop,
      height: item.offsetHeight,
    }))
  let last
  const positionDate = {}
  items.forEach(item => {
    if (!last) {
      last = item
      positionDate[item.top] = item.date
      return
    }
    const duration = item.date - last.date
    const diff = item.top - last.top
    Array.from({length: diff}, (_, i) => i).forEach(top => {
      const minutes = (top * duration) / diff
      positionDate[last.top + top] = round10(last.date + minutes)
    })
    last = item
  })
  return positionDate
}

const editingStyle = {
  touchAction: 'none',
  background: '#422',
}

const EditingEvent = ({startDate, value: {date, location}, onChange}) => {
  const [position, setPosition] = useState('')
  const ref = useRef({})
  const handleDrag = event => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    if (!ref.current.offsetTop) {
      ref.current.offsetTop = event.currentTarget.offsetTop
      ref.current.positionDate = getTimePosition(
        event.currentTarget.parentElement,
      )
    }
    ref.current.startY = event.clientY - (position.y || 0)
  }
  const handleMove = event => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }
    const y = Math.round(event.clientY - ref.current.startY)
    setPosition({y})
  }
  const editedDate =
    position?.y && ref.current.positionDate[ref.current.offsetTop + position.y]
  const handleRelease = event => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    onChange(event, {name: 'date', value: editedDate || date})
  }

  return (
    <EventCard
      class={css(editingStyle, {transform: `translateY(${position.y || 0}px)`})}
      startDate={startDate}
      date={editedDate || date}
      location={location}
      onPointerDown={handleDrag}
      onPointerMove={handleMove}
      onPointerUp={handleRelease}
    />
  )
}

export default EditingEvent
