import {css} from '@emotion/css'
import {useState, useReducer, useEffect} from 'preact/hooks'

import {loadTrip, reduceEdit, getEdited, saveTrip} from './trip'
import EditForm from './EditForm'
import Draggable from './Draggable'

const actionsStyle = {
  position: 'fixed',
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  '> button, input': {
    margin: '0 0.5em 0.5em',
    fontSize: '1.5em',
  },
  '> button': {
    padding: '0.25em',
    background: '#c60',
    border: 'none',
    borderRadius: '0.5em',
  },
}

const PlanActions = ({editing, onCreate, onChange, onCancel, onSave}) => {
  const [action, setAction] = useState('top')
  const overideAction = editing ? 'edit' : action

  return (
    <div class={css(actionsStyle)}>
      {editing ? (
        <EditForm
          editing={editing}
          onChange={onChange}
          onCancel={onCancel}
          onSave={onSave}
        />
      ) : (
        overideAction === 'top' && (
          <>
            <button type="button" aria-label="New Trip" onClick={onCreate}>
              ✨
            </button>
            <button type="button" onClick={() => setAction('list')}>
              📋
            </button>
          </>
        )
      )}
    </div>
  )
}

const Schedule = ({data, editing, replacedNode, onEdit}) => (
  <div>
    {data.map((item, index) => (
      <>
        {index === editing?.index && editing.mode !== 'insert' ? (
          replacedNode
        ) : item.date ? (
          <h3 onClick={event => onEdit(event, {index})}>
            {item.date} {item.remark}{' '}
            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                onEdit(event, {type: 'add-event', index: index})
              }}
            >
              ＋
            </button>
          </h3>
        ) : (
          <div onClick={event => onEdit(event, {index})}>
            {item.type} {item.time} {item.place} {item.toPlace && ' - '}{' '}
            {item.toPlace} {item.arriveAt} {item.note}
          </div>
        )}
        {index === editing?.index && editing.mode === 'insert' && replacedNode}
      </>
    ))}
    {editing?.index + 1 > data.length && replacedNode}
    <button
      type="button"
      onClick={event => onEdit(event, {type: 'add-day', index: data.length})}
    >
      ＋
    </button>
  </div>
)

const getTime = (prev = {time: '06:00 '}, next = {time: '23:30'}, ratio) => {
  const prevTime = (prev.time || '06:00').split(':').map(Number)
  const nextTime = next.time.split(':').map(Number)
  const prevMinutes = prevTime[0] * 60 + prevTime[1]
  const nextMinutes = nextTime[0] * 60 + nextTime[1]
  const movedMinutes = prevMinutes + (nextMinutes - prevMinutes) * ratio
  const hours = Math.floor(movedMinutes / 60)
  const minutes = Math.floor(movedMinutes % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const getMovedTime = (event, {y, data}) => {
  const position = event.currentTarget.offsetTop + y
  window.debugNode = event.currentTarget
  const nodes = [].concat(
    Array.from(event.currentTarget.parentElement.children),
    {offsetTop: position + 50},
  )
  const nextIndex = nodes.findIndex(node => node.offsetTop >= position)
  const length = nodes[nextIndex].offsetTop - nodes[nextIndex - 1].offsetTop
  const ratio = (position - nodes[nextIndex - 1].offsetTop) / length
  return getTime(data[nextIndex - 1], data[nextIndex], ratio)
}

const EditingEvent = ({editing, data}) => {
  const [movedTime, setMovedTime] = useState(() => getEdited(editing, 'time'))
  const changeTime = (event, {y, state}) => {
    setMovedTime(getMovedTime(event, {y, data}))
  }

  return getEdited(editing, 'date') ? (
    <h3 class={css({backgroundColor: '#732  '})}>
      {getEdited(editing, 'date')} {getEdited(editing, 'remark')}
    </h3>
  ) : (
    <Draggable onChange={changeTime}>
      <div class={css({backgroundColor: '#a55'})}>
        {getEdited(editing, 'type')} {movedTime}
        {getEdited(editing, 'place')}
        {getEdited(editing, 'toPlace') && ' - '}
        {getEdited(editing, 'toPlace')} {getEdited(editing, 'arriveAt')}
        {getEdited(editing, 'note')}
      </div>
    </Draggable>
  )
}

const Plan = () => {
  const [collection, setCollection] = useState(() => ({}))
  const [tripData, setTripData] = useState()
  const [editing, dispatch] = useReducer(reduceEdit)
  useEffect(() => {
    loadTrip(collection.viewingTrip).then(({trips, viewingTrip, data}) => {
      setCollection({trips, viewingTrip})
      setTripData(data)
    })
  }, [collection.viewingTrip])
  const create = () => dispatch({type: 'new'})
  const edit = (_event, options) =>
    dispatch({
      type: options.type || 'start',
      index: options.index,
      initial: tripData[options.index],
      tripData,
    })
  const change = event =>
    dispatch({
      type: 'change',
      key: event.target.name,
      value: event.target.value,
    })
  const cancel = () => dispatch({type: 'clear'})
  const save = () => {
    dispatch({type: 'clear'})
    saveTrip(tripData, editing)
  }
  const currentTripData = editing?.newTrip || tripData

  return (
    <div>
      {currentTripData ? (
        <Schedule
          data={currentTripData}
          editing={editing}
          replacedNode={
            editing?.index >= 0 && (
              <EditingEvent editing={editing} data={tripData} />
            )
          }
          onEdit={edit}
        />
      ) : (
        'click to create new trip'
      )}
      <PlanActions
        collection={collection}
        editing={editing}
        onCreate={create}
        onChange={change}
        onCancel={cancel}
        onSave={save}
      />
    </div>
  )
}

export default Plan
