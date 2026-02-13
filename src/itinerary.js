import {formatTime, getEndOfDay, getTimestamp, hoursOf} from './datetime'
import iataTimeZone from './iataTimeZone'

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

const getDailyEvents = ({date}) => ({
  breakfast: {
    defaultDate: hoursOf(date, 6, 30, 0, 0),
    tags: ['breakfast'],
  },
  activity: {
    defaultDate: hoursOf(date, 9, 0, 0, 0),
    tags: [],
  },
  lunch: {
    defaultDate: hoursOf(date, 11, 30, 0, 0),
    tags: ['lunch'],
  },
  dinner: {
    defaultDate: hoursOf(date, 18, 30, 0, 0),
    tags: ['dinner'],
  },
  accommodation: {
    defaultDate: hoursOf(date, 21, 30, 0, 0),
    tags: ['accommodation'],
  },
})

const getTimeZone = (data = {}) => {
  const destinationAirport = data.transit?.at(-1)?.split(' ')[3]
  return iataTimeZone[destinationAirport]
}

const expandItinerary = itinerary => {
  const defaultDate = getTimestamp(date => date.setMonth(date.getMonth() + 1))
  const departureDate = itinerary[0]?.date
    ? getTimestamp(date => {
        date.setTime(itinerary[0].date)
        date.setDate(date.getDate() - 1)
      })
    : defaultDate
  const returnDate = itinerary.at(-1)?.date
    ? getTimestamp(date => date.setTime(itinerary.at(-1).date))
    : defaultDate
  const hintDeparture = itinerary[0]?.tags.includes('departure')
    ? undefined
    : {date: departureDate, tags: ['departure'], transit: []}
  const hintReturn = itinerary.at(-1)?.tags.includes('return')
    ? undefined
    : {date: returnDate, tags: ['return'], transit: []}
  const expanded = itinerary.reduce((items, event, index) => {
    const dayDuration = 86400000
    const lastEvent = items.at(-1)
    const timeZone = getTimeZone(lastEvent) || lastEvent?.timeZone
    const lastDate = getEndOfDay(lastEvent?.date || event.date - dayDuration, {timeZone})
    const fill = Array.from(
      {length: Math.ceil((event.date - lastDate) / dayDuration)},
      (_, index) => {
        const date = lastDate + 1000 + index * dayDuration
        return {
          type: 'head',
          date,
          timeZone,
          dailyEvents: getDailyEvents({date}),
        }
      },
    )
    const headIndex =
      fill.length > 0 ? items.length + fill.length - 1 : items.at(-1).headIndex
    const head = fill.at(-1) || items[headIndex]
    const data = {...event, listIndex: index, headIndex, timeZone}
    if (head.dailyEvents?.[event.tags?.[0]]) {
      head.dailyEvents[event.tags[0]] = data
    }
    return items.concat(fill, data)
  }, [])

  return [].concat(hintDeparture, expanded, hintReturn).filter(Boolean)
}

const edit = (itinerary, {listIndex, index, ...values}) =>
  (listIndex >= 0
    ? itinerary.slice(0, listIndex).concat(itinerary.slice(listIndex + 1))
    : itinerary
  )
    .concat(values.location || values.transit?.length > 0 ? values : [])
    .sort((a, b) => new Date(a.date) - new Date(b.date))


const planTransit = (itinerary, {editing}) => {
  const previous = itinerary[editing.index - 1]
  if (previous.transit) {
    return {...previous, index: editing.index - 1}
  }
  const current = itinerary[editing.index]
  const arrival = current.date - 5 * 60 * 1000
  const destination = current.location.replace(/\s+/g, '')
  const from = (previous.location || '-').replace(/\s+/g, '')

  return {
    defaultDate: arrival,
    date: arrival,
    index: 'new',
    tags: ['transit'],
    transit: [
      `${formatTime(arrival - 30 * 60 * 1000)} ${from} - ${destination} ${formatTime(arrival)}`,
    ],
  }
}

export {getDailyItinerary, expandItinerary, edit, planTransit}
