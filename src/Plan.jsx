import {css} from '@emotion/css'
import {useState} from 'preact/hooks'

import EditEventDetail from './EditEventDetail'
import EditingEvent from './EditingEvent'
import EventCard from './EventCard'
import {
  edit as editItinerary,
  expandItinerary,
  getDailyItinerary,
  planTransit,
} from './itinerary'
import Layout from './Layout'
import SuggestedEvent from './SuggestedEvent'
import {updatedDate} from './datetime'
import DayHeader from './DayHeader'

const hourOfDay = (dayStart, hour) => dayStart + hour * 60

const arrivalTime = ({date, duration}) => date + duration

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

const FormattedDate = ({date, timezone}) => {
  const now = new Date(date)
  const month = now.toLocaleDateString('en', {
    month: '2-digit',
    timeZone: timezone,
  })
  const day = now.toLocaleDateString('en', {day: '2-digit', timeZone: timezone})
  const weekday = now.toLocaleDateString('ja', {
    weekday: 'short',
    timeZone: timezone,
  })

  return `${month}-${day} ${weekday}`
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

const Itinerary = ({items, slotIndex, children, onEdit, onCreate}) => (
  <div class={css(itineraryStyle)}>
    {items.map((item, index) =>
      slotIndex && (slotIndex === item.index || slotIndex === index) ? (
        children
      ) : item.location ? (
        <EventCard {...item} onClick={() => onEdit(item, index)} />
      ) : item.type === 'head' ? (
        <DayHeader {...item} onClick={(_, data) => onCreate(data)} />
      ) : (
        <SuggestedEvent tags={item.tags} onClick={() => onEdit(item, index)} />
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
    const parsed = JSON.parse(localStorage.getItem('saved-itinerary'))
    if (parsed[0].date) {
      return parsed
    }
  } catch (e) {}
  return []
}

// TODO empty state
const Plan = () => {
  const [itinerary, setItinerary] = useState(() => tryLoad())
  const baseDate = itinerary[0]?.baseDate
  const [editingItem, setEditingItem] = useState({})
  const filledItinerary = addNewPlaceholder(
    expandItinerary(itinerary),
    editingItem,
  )

  const onCreate = (item, targetIndex = 'new') => {
    console.debug('create', item)
    const index = item.listIndex
      ? filledItinerary.findIndex(event => event.listIndex === item.listIndex)
      : 'new'
    setEditingItem({...item, index: index >= 0 ? index : targetIndex})
  }
  const onEdit = (item, index) => {
    console.debug('edit', item, index)
    setEditingItem({...item, index})
  }
  const onPlanTransit = () =>
    setEditingItem(
      planTransit(filledItinerary, {editing: editingItem, startDate: baseDate}),
    )
  const onChange = (_event, {name, value}) =>
    setEditingItem({
      ...editingItem,
      [name]: name === 'date' ? updatedDate(editingItem.date, value) : value,
    })

  const onCancel = () => setEditingItem({})
  const onSave = values => {
    console.debug('save', values, editingItem)
    setEditingItem({})
    const edited = editItinerary(itinerary, {
      ...editingItem,
      ...values,
      date: values.date || editingItem.defaultDate,
    })
    edited[0].baseDate = baseDate
    setItinerary(edited)
    localStorage.setItem('saved-itinerary', JSON.stringify(edited, null, 2))
  }
  const editing = editingItem.index >= 0 || editingItem.index === 'new'

  return (
    <Layout editing={editing}>
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
    </Layout>
  )
}

export default Plan
