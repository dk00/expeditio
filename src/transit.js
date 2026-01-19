import {formatTime} from './datetime'

const dateTypeArrival = 4

const getTransitUrl = ({ date, route}) => {
  const dateObject = new Date(date)
  const [, from, , to, arrivalTime = ''] = route.split(' ')
  const [hours, minutes = ''] = arrivalTime.split(':')
  const params = {
    from,
    to,
    type: dateTypeArrival,
    y: dateObject.getFullYear(),
    m: dateObject.getMonth() + 1,
    d: dateObject.getDate(),
    hh: hours,
    m1: minutes[0],
    m2: minutes[1],
    shin: 1,
    ex: 1,
    hb: 1,
    lb: 1,
    sr: 1,
  }
  const searchParams = new URLSearchParams(Object.entries(params))

  return `https://transit.yahoo.co.jp/search/result?${searchParams.toString()}`
}

const addRoute = (_event, routes, data) => {
  const [arrival, destination] = (routes[0] || '0:00 destination').split(' ')
  const [hours, minutes] = arrival.split(':')
  const tmp = new Date()
  tmp.setHours(hours)
  tmp.setMinutes(minutes)
  const start = formatTime(-30, tmp)
  const first = `${start} ${data.location || 'from'} - ${destination} ${arrival}`

  return [first].concat(routes)
}

const editTransit = (event, routes, index) =>
  index < 1 && event.target.value.length < 1
    ? routes.slice(1)
    : Object.assign([], routes, {[index]: event.target.value})

export {getTransitUrl, editTransit, addRoute}
