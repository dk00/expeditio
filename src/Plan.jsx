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
          <div data-time={item.time} onClick={event => onEdit(event, {index})}>
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

const getMinutes = time => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const formatTime = next => {
  const hours = Math.floor(next / 60)
  const minutes = Math.floor(next % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const getMovedTime = (event, {y}) => {
  const position = event.currentTarget.offsetTop + y
  const nodes = [].concat(
    Array.from(event.currentTarget.parentElement.children),
    {offsetTop: event.currentTarget.offsetTop + 80},
  )
  const index = nodes.findIndex(node => node.offsetTop >= position) - 1
  const prevNode = nodes[index]
  const nextNode = nodes[index + 1]
  const length = nextNode.offsetTop - prevNode.offsetTop
  const ratio = (position - prevNode.offsetTop) / length
  const prevTime = getMinutes(prevNode.dataset?.time || '02:00')
  const duration = getMinutes(nextNode.dataset?.time || '23:30') - prevTime
  const moved = Math.round(duration * ratio /10) * 10

  return [index,formatTime(prevTime + moved)]
}

const EditingEvent = ({editing, onMove}) => {
  const [movedTime, setMovedTime] = useState(() => getEdited(editing, 'time'))
  const changeTime = (event, {y, state}) => {
    const [index, time] = getMovedTime(event, {y})
    setMovedTime(time)
    if (state === 'end') {
      onMove?.(event, {time, index})
    }
  }

  return getEdited(editing, 'date') ? (
    <h3 class={css({backgroundColor: '#732'})}>
      {getEdited(editing, 'date')} {getEdited(editing, 'remark')}
    </h3>
  ) : (
    <Draggable data-time={editing.initial?.time} onChange={changeTime}>
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
  const move = (_event, options) =>
    dispatch({
      type: 'move',
      index: options.index,
      time: options.time,
    })
  const cancel = () => dispatch({type: 'clear'})
  const save = async () => {
    dispatch({type: 'clear'})
    setTripData(await saveTrip(tripData, editing))
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
              <EditingEvent editing={editing} onMove={move} />
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
