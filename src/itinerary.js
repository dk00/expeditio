const startOfDay = (minutesOfJourney, base) =>
  minutesOfJourney - ((base + minutesOfJourney) % 1440)

const fillItineraryDays = (dayList, date, base) => {
  const currentDay = startOfDay(date, base) // TODO timezone offset
  if (!dayList.length) {
    return [{date: currentDay, items: []}]
  }
  const next = dayList.at(-1).date + 1440
  return date < next
    ? dayList
    : fillItineraryDays(dayList.concat({date: next, items: []}), date, base)
}


// assume itinerary is sorted by date
const getDailyItinerary = (itinerary, baseDate) => {
  const base = new Date(baseDate)
  const baseMinutes = base.getHours() * 60 + base.getMinutes()

  return itinerary.reduce((last, item, index) => {
    const dayList = fillItineraryDays(last, item.date, baseMinutes)
    const currentDay = dayList.at(-1)
    currentDay.items = currentDay.items.concat({...item, listIndex: index})
    return dayList
  }, [])
}

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

export {getDailyItinerary, edit, planTransit}
