import {css} from '@emotion/css'
import {useState} from 'preact/hooks'

import EditEventDetail from './EditEventDetail'
import EditingEvent from './EditingEvent'
import EventCard from './EventCard'
import {edit as editItinerary, planTransit} from './itinerary'
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

const handleSlot = (
  element,
  {index, slotIndex, slotPlacement = 'replace', slotElement},
) => (
  <>
    {index === slotIndex && slotElement}
    {index === slotIndex && slotPlacement === 'replace' ? '' : element}
  </>
)

const itineraryStyle = {
  h3: {
    margin: 0,
    padding: '0.5em',
    button: {
      marginLeft: '0.5em',
      fontSize: '100%',
    },
  },
}

const Itinerary = ({
  items,
  startDate,
  slotIndex,
  slotPlacement = 'replace',
  children,
  onEdit,
  onCreate,
}) => (
  <div class={css(itineraryStyle)}>
    {items.map((item, index) =>
      handleSlot(
        item.type === 'head' ? (
          <h3 data-date={hourOfDay(item.date, 5)}>
            <FormattedDate startDate={startDate} date={item.date} />
            <button
              type="button"
              onClick={() =>
                onCreate({
                  defaultDate: hourOfDay(item.date, 10),
                  date: hourOfDay(item.date, 10),
                  index: 'new',
                  tags: ['event'],
                })
              }
            >
              + Event
            </button>
          </h3>
        ) : item.location ? (
          <EventCard
            startDate={startDate}
            {...item}
            onClick={() => onEdit(item, index)}
          />
        ) : (
          <SuggestedEvent {...item} onClick={() => onCreate(item, index)} />
        ),
        {
          index: item.index || index,
          slotIndex,
          slotPlacement,
          slotElement: children,
        },
      ),
    )}
  </div>
)

const addNewPlaceholder = (itinerary, editingItem) => {
  if (editingItem.index !== 'new') {
    return itinerary
  }
  const insertAt = itinerary
    .concat({date: Infinity})
    .findIndex(item => item.date >= editingItem.defaultDate)

  return itinerary
    .slice(0, insertAt)
    .concat(editingItem)
    .concat(itinerary.slice(insertAt))
}

const tryLoad = () => {
  try {
    return JSON.parse(localStorage.savedItinerary)
  } catch (e) {}
}

const layoutStyle = {
  '@media (orientation: portrait)': {
    '> div:last-of-type': {
      // edit detail, appear from bottom
      position: 'fixed',
      bottom: 0,
      transform: 'translateY(100%)',
      transition: 'transform 0.3s ease-in-out',
    },
  },
  '@media (orientation: landscape)': {
    display: 'flex',
    '> div:first-of-type': {
      // itinerary, left side
      flex: '0 0 62%',
    },
    '> div:last-of-type': {
      // edit detail, right side
      position: 'sticky',
      top: '5em',
      flex: '1',
      alignSelf: 'flex-start',
    },
  },
}

const editingStyle = {
  '@media (orientation: portrait)': {
    '> div:last-of-type': {
      transform: 'translateY(0)',
    },
  },
}

const App = () => {
  const baseDate = mock()[0]?.date
  const [itinerary, setItinerary] = useState(() => tryLoad() || rebase(mock()))
  const [editingItem, setEditingItem] = useState({})
  const filledItinerary = addNewPlaceholder(
    getFilledItinerary(itinerary, baseDate),
    editingItem,
  )

  const onCreate = (item, index = 'new') => {
    console.log('create', item)
    setEditingItem({...item, index})
  }
  const onEdit = (item, index) => {
    console.log('edit', item, index)
    setEditingItem({...item, index})
  }
  const onPlanTransit = () =>
    setEditingItem(
      planTransit(filledItinerary, {editing: editingItem, startDate: baseDate}),
    )
  const onChange = (_event, {name, value}) =>
    setEditingItem({...editingItem, [name]: value})

  const onCancel = () => setEditingItem({})
  const onSave = values => {
    console.log('save', values)
    setEditingItem({})
    const edited = editItinerary(itinerary, {...editingItem, ...values})
    setItinerary(edited)
    localStorage.savedItinerary = JSON.stringify(edited, null, 2)
  }

  return (
    <div class={css(layoutStyle, editingItem.index >= 0 && editingStyle)}>
      <Itinerary
        items={filledItinerary}
        startDate={baseDate}
        slotIndex={editingItem.index}
        onCreate={onCreate}
        onEdit={onEdit}
      >
        {editingItem.index != null && (
          <EditingEvent
            key={editingItem.index}
            startDate={baseDate}
            value={editingItem}
            onChange={onChange}
          />
        )}
      </Itinerary>
      <EditEventDetail
        startDate={baseDate}
        current={editingItem}
        onChange={onChange}
        onPlanTransit={onPlanTransit}
        onCancel={onCancel}
        onSave={onSave}
      />
    </div>
  )
}

export default App
