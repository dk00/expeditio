import {css} from '@emotion/css'
import {useState} from 'preact/hooks'

import EditEventDetail from './EditEventDetail'
import EditingEvent from './EditingEvent'
import EventCard from './EventCard'
import {
  edit as editItinerary,
  getDailyItinerary,
  planTransit,
} from './itinerary'
import Layout from './Layout'
import SuggestedEvent from './SuggestedEvent'

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

const FormattedDate = ({startDate, date}) => {
  const now = new Date(startDate)
  now.setMinutes(now.getMinutes() + date)
  const weekday = now.toLocaleDateString('ja', {weekday: 'short'})
  return `${now.getMonth() + 1}-${now.getDate()} ${weekday}`
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
    const parsed = JSON.parse(localStorage.getItem('saved-itinerary'))
    if (parsed[0].baseDate) {
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
    getFilledItinerary(itinerary, baseDate),
    editingItem,
  )

  const onCreate = (item, index = 'new') => {
    console.debug('create', item)
    setEditingItem({...item, index})
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
    setEditingItem({...editingItem, [name]: value})

  const onCancel = () => setEditingItem({})
  const onSave = values => {
    console.debug('save', values)
    setEditingItem({})
    const edited = editItinerary(itinerary, {...editingItem, ...values})
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
    </Layout>
  )
}

export default Plan
