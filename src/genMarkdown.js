import {getDailyItinerary} from './itinerary'

const FormattedTime = ({startDate, date}) => {
  const actualDate = startDate && new Date(startDate)
  actualDate.setMinutes(actualDate.getMinutes() + date)
  const now = date.length ? new Date(date) : actualDate
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const FormattedDate = ({startDate, date}) => {
  const now = new Date(startDate)
  now.setMinutes(now.getMinutes() + date)
  const weekday = now.toLocaleDateString('ja', {weekday: 'short'})
  return `${now.getMonth() + 1}-${now.getDate()} ${weekday}`
}

const genMarkdown = (itinerary, {baseDate}) =>
  getDailyItinerary(itinerary, baseDate).flatMap(day => [
    `**${FormattedDate({startDate: baseDate, date: day.date})}**`,
    ...day.items.map(item =>
      item.transit
        ? item.transit.join('\n')
        : `${FormattedTime({startDate: baseDate, date: item.date})} ${item.location}`,
    ),
  ])

export default genMarkdown
