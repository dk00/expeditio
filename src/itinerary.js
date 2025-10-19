const edit = (itinerary, {listIndex, index, ...values}) =>
  (listIndex >= 0
    ? itinerary.slice(0, listIndex).concat(itinerary.slice(listIndex + 1))
    : itinerary
  )
    .concat(values)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

const formatTime = (minutes, startDate) => {
  const now = new Date(startDate)
  now.setMinutes(now.getMinutes() + minutes)
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

const planTransit = (itinerary, {editing, startDate}) => {
  const previous = itinerary[editing.index - 1]
  if (previous.transit) {
    return {...previous, index: editing.index - 1}
  }
  const current = itinerary[editing.index]
  const arrival = current.date - 5
  const destination = current.location.replace(/\s+/g, '')
  const from = previous.location.replace(/\s+/g, '')

  return {
    defaultDate: arrival,
    date: arrival,
    index: 'new',
    tags: ['transit'],
    transit: [
      `${formatTime(arrival - 30, startDate)} ${from} - ${destination} ${formatTime(arrival, startDate)}`,
    ],
  }
}

export {edit, planTransit}
