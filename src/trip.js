import {getTripKeys, getTrip, setTrip} from './io'
import {parsePlan, formatPlan} from './format'

const loadTrip = async tripKey => {
  const trips = await getTripKeys()
  const viewingTrip = tripKey || trips[0]
  const data = viewingTrip ? parsePlan(await getTrip(viewingTrip)) : undefined
  return {trips, viewingTrip, data}
}

const createTrip = async ({startDate}) => {
  setTrip(startDate, formatPlan([{date: startDate}]))
  return {viewingTrip: startDate, tripList: [startDate]}
}

const getEdited = (state, key) =>
  key in state.changed ? state.changed[key] : state.initial[key]

const saveTrip = async (data = [], editInfo) => {
  console.log('Saving trip with editInfo:', editInfo)
  const sliceIndex = editInfo.index + (editInfo.mode === 'insert' ? 1 : 0)
  const updated = data
    .slice(0, sliceIndex)
    .concat({
      ...editInfo.initial,
      ...editInfo.changed,
    })
    .concat(data.slice(editInfo.index + 1))
  const tripKey = updated[0].date
  setTrip(tripKey, formatPlan(updated))
  return updated
}

const getDefaultTripDate = () => {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split('T')[0]
}

const getNextTime = () => '08:00'

const getNextDate = tripData => {
  const d = new Date(tripData[0].date)
  const days = tripData.filter(item => item.date)
  d.setDate(d.getDate() + days.length)
  return d.toISOString().split('T')[0]
}

const transitPattern = /(.+?)\s+(?:-|->|→)\s+(.+?)/g
const expandTransit = values => {
  const [, place, toPlace] =
    Array.from((values.place || '').matchAll(transitPattern))[0] || []
  return place && toPlace ? {...values, place, toPlace} : values
}

const reduceEdit = (state, action) =>
  action.type === 'start'
    ? {index: action.index, initial: action.initial, changed: {}}
    : action.type === 'change'
      ? {
          ...state,
          changed: expandTransit({...state.changed, [action.key]: action.value}),
        }
      : action.type === 'move'
        ? {
            ...state,
            index: action.index,
            changed: {...state.changed, time: action.time},
          }
      : action.type === 'add-event'
        ? {
            mode: 'insert',
            index: action.index,
            initial: {time: getNextTime(action.tripData)},
            changed: {},
          }
        : action.type === 'add-day'
          ? {
              mode: 'insert',
              index: action.index,
              initial: {},
              changed: {date: getNextDate(action.tripData)},
            }
          : action.type === 'new'
            ? {
                index: 0,
                newTrip: [],
                initial: {date: getDefaultTripDate()},
                changed: {},
              }
            : action.type === 'clear'
              ? undefined
              : state

export {loadTrip, createTrip, getEdited, saveTrip, reduceEdit}
