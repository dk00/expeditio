import {css} from '@emotion/css'
import {useState} from 'preact/hooks'

import EditEventDetail from './EditEventDetail'
import EditingEvent from './EditingEvent'
import EventCard from './EventCard'
import {edit as editItinerary} from './itinerary'
import mock from './mock'
import SuggestedEvent from './SuggestedEvent'

const startOfDay = (minutesOfJourney, base) =>
  minutesOfJourney - ((base + minutesOfJourney) % 1440)

const hourOfDay = (dayStart, hour) => dayStart + hour * 60

const arrivalTime = ({date, duration}) => date + duration

const rebase = events => {
  const start = new Date(events[0]?.date)
  return events.map(event => ({
    ...event,
    date: Math.round((new Date(event.date) - start) / 60000),
  }))
}

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
    if (tags.includes('accommodation')) {
      result.accommodation = item.date
    }
    if (tags.includes('return')) {
      result.end = item.date
    }
    return result
  }, {})

  const essentials = [
    {date: hourOfDay(current, 5), tags: ['breakfast']},
    {date: hourOfDay(current, 12), tags: ['lunch']},
    {date: hourOfDay(current, 19), tags: ['dinner']},
    {date: hourOfDay(current, 23), tags: ['accommodation']},
  ].filter(
    item =>
      !times[item.tags[0]] &&
      !(item.date < times.start) &&
      !(item.date > times.end),
  )

  return essentials.concat(items).sort((a, b) => a.date - b.date)
}

const getFilledItinerary = (itinerary, baseDate) =>
  getDailyItinerary(itinerary, baseDate).reduce((last, day) => {
    const items = suggestEssentials(day.items, day.date)
    return last.concat({type: 'head', date: day.date}, items)
  }, [])

const FormattedDate = ({startDate, date}) => {
  const now = new Date(startDate)
  now.setMinutes(now.getMinutes() + date)
  return `${now.getMonth() + 1}-${now.getDate()}`
}

const Itinerary = ({
  items,
  startDate,
  replaceIndex,
  replaceItem,
  onEdit,
  onCreate,
}) => (
  <div class={css({h3: {margin: 0, padding: '0.5em'}})}>
    {items.map((item, index) =>
      item.type === 'head' ? (
        <h3 data-date={hourOfDay(item.date, 5)}>
          <FormattedDate startDate={startDate} date={item.date} />
        </h3>
      ) : index === replaceIndex ? (
        replaceItem
      ) : item.location ? (
        <EventCard
          startDate={startDate}
          {...item}
          onClick={() => onEdit(item, index)}
        />
      ) : (
        <SuggestedEvent {...item} onClick={() => onCreate(item, index)} />
      ),
    )}
  </div>
)

const App = () => {
  const baseDate = mock()[0]?.date
  const [itinerary, setItinerary] = useState(() => rebase(mock()))
  const [editingItem, setEditingItem] = useState({})
  const filledItinerary = getFilledItinerary(itinerary, baseDate)

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
        startDate={baseDate}
        replaceIndex={editingItem.index}
        replaceItem={
          editingItem.date && (
            <EditingEvent
              key={editingItem.index}
              startDate={baseDate}
              value={editingItem}
              onChange={onChange}
            />
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
      <div
        class={css({
          position: 'fixed',
          bottom: '0.5em',
          padding: '0.5em 0.7em',
          borderRadius: '50%',
          background: '#f59',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          fontSize: '1em',
          fontWeight: 'bold',
          transition: 'border-radius 0.3s ease',
          '&:hover': {
            borderRadius: '1em',
          },
        })}
      >
        +
      </div>
    </div>
  )
}

export default App
