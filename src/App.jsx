import {css} from '@emotion/css'
import {useState} from 'preact/hooks'

import EditEventDetail from './EditEventDetail'
import EditingEvent from './EditingEvent'
import EventCard from './EventCard'
import {edit as editItinerary} from './itinerary'
import mock from './mock'
import SuggestedEvent from './SuggestedEvent'

const endOfDay = date => {
  const now = new Date(date)
  now.setHours(23, 59, 59, 999)

  return now.toJSON()
}

const nextDay = date => {
  if (!date) return
  const now = new Date(date)
  now.setDate(now.getDate() + 1)

  return now.toJSON()
}

const timeOfDay = (date, time) => {
  const [hours, minutes] = time.split(':')
  const now = new Date(date)
  now.setHours(hours, minutes, 0, 0)
  return now.toJSON()
}

const arrivalTime = ({date, duration}) => {
  const now = new Date(date)
  now.setMinutes(now.getMinutes() + duration)
  return now.toJSON()
}

const fillItineraryDays = (dayList, date) => {
  if (!dayList.length) {
    return [{date: endOfDay(date), items: []}]
  }
  const lastDate = dayList.at(-1)?.date
  return date <= lastDate
    ? dayList
    : fillItineraryDays(
        dayList.concat({date: nextDay(lastDate), items: []}),
        date,
      )
}

// assume itinerary is sorted by date
const getDailyItinerary = itinerary => {
  // TODO timzone for start date
  const startDate = new Date(itinerary[0].date)

  return itinerary.reduce((last, item, index) => {
    const dayList = fillItineraryDays(last, item.date)
    const currentDay = dayList.at(-1)
    currentDay.items = currentDay.items.concat({...item, listIndex: index})
    return dayList
  }, [])
}

const suggestEssentials = (items, current) => {
  const times = items.reduce((result, item) => {
    const tags = item.tags || []
    if (tags.includes('departure')) {
      result.start = arrivalTime(item)
    }
    const meal = tags.find(tag => /breakfast|lunch|dinner/.test(tag))
    if (meal) {
      result[meal] = item.date
    }
    if (tags.includes('return')) {
      result.end = item.date
    }
    return result
  }, {})

  const essentials = [
    {date: timeOfDay(current, '05:00'), tags: ['breakfast']},
    {date: timeOfDay(current, '12:00'), tags: ['lunch']},
    {date: timeOfDay(current, '19:00'), tags: ['dinner']},
    {date: timeOfDay(current, '23:00'), tags: ['accommodation']},
  ].filter(
    item =>
      !times[item.tags[0]] &&
      !(item.date < times.start) &&
      !(item.date > times.end),
  )

  return essentials.concat(items).sort((a, b) => a.date.localeCompare(b.date))
}

const getFilledItinerary = itinerary =>
  getDailyItinerary(itinerary).reduce((last, day) => {
    const items = suggestEssentials(day.items, day.date)
    return last.concat({type: 'head', date: day.date}, items)
  }, [])

const FormattedDate = ({date}) => {
  const now = new Date(date)
  return `${now.getMonth() + 1}-${now.getDate()}`
}

const Itinerary = ({items, replaceIndex, replaceItem, onEdit, onCreate}) => (
  <div class={css({h3: {margin: 0, padding: '0.5em'}})}>
    {items.map((item, index) =>
      item.type === 'head' ? (
        <h3 data-date={timeOfDay(item.date, '05:00')}>
          <FormattedDate date={item.date} />
        </h3>
      ) : index === replaceIndex ? (
        replaceItem
      ) : item.location ? (
        <EventCard {...item} onClick={() => onEdit(item, index)} />
      ) : (
        <SuggestedEvent {...item} onClick={() => onCreate(item, index)} />
      ),
    )}
  </div>
)

const App = () => {
  const [itinerary, setItinerary] = useState(mock)
  const [editingItem, setEditingItem] = useState({})
  const filledItinerary = getFilledItinerary(itinerary)

  const onCreate = (item, index) => {
    console.log('create', item)
    setEditingItem({...item, index})
  }
  const onEdit = (item, index) => {
    console.log('edit', item, index)
    setEditingItem({...item, index})
  }
  const onChange = (_event, {name, value}) =>
    setEditingItem({...editingItem, [name]: value})

  const onCancel = () => setEditingItem({})
  const onSave = values => {
    console.log('save', values)
    setEditingItem({})
    setItinerary(editItinerary(itinerary, {...editingItem, ...values}))
  }

  return (
    <div>
      <Itinerary
        items={filledItinerary}
        replaceIndex={editingItem.index}
        replaceItem={
          editingItem.date && (
            <EditingEvent value={editingItem} onChange={onChange} />
          )
        }
        onCreate={onCreate}
        onEdit={onEdit}
      />
      <EditEventDetail
        current={editingItem}
        onChange={onChange}
        onCancel={onCancel}
        onSave={onSave}
      />
    </div>
  )
}

export default App
