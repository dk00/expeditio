import {css} from '@emotion/css'
import {useState, useEffect} from 'preact/hooks'

import EditEventDetail from './EditEventDetail'
import EditingEvent from './EditingEvent'
import EventCard from './EventCard'
import {
  edit as editItinerary,
  expandItinerary,
  planTransit,
} from './itinerary'
import Layout from './Layout'
import SuggestedEvent from './SuggestedEvent'
import {updatedDate} from './datetime'
import DayHeader from './DayHeader'

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
      ) : (item.location || item.transit) ? (
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

const tryLoad = ({index = 0} = {}) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(`saved-itinerary-${index}`))
    if (parsed[0].date) {
      return parsed
    }
  } catch (e) {}
  return []
}

const switchPlansStyle = {
  button: {
    margin: '0.1rem 0',
    flex: '0 0 3rem',
    width: '100%',
    border: 'none',
    textAlign: 'center',
    fontSize: '2em',
    transition: 'background 0.3s ease-in-out',
  },
}

const selectedPlanStyle = {
  background: 'pink',
}

const SwitchPlans = ({value, length, onChange}) => (
  <div class={css(switchPlansStyle)}>
    {Array.from({length}).map((_, index) => (
      <button
        class={value === index && css(selectedPlanStyle)}
        type="button"
        onClick={() => onChange(index)}
      >
        {index}
      </button>
    ))}
  </div>
)

// TODO empty state
const Plan = () => {
  const [itinerary, setItinerary] = useState(() => tryLoad())
  const [planIndex, setPlanIndex] = useState(0)
  useEffect(() => {
    setItinerary(tryLoad({index: planIndex}))
  }, [planIndex])
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
    localStorage.setItem(
      `saved-itinerary-${planIndex}`,
      JSON.stringify(edited, null, 2),
    )
  }
  const editing = editingItem.index >= 0 || editingItem.index === 'new'

  return (
    <Layout editing={editing}>
      <SwitchPlans value={planIndex} length={2} onChange={setPlanIndex} />
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
