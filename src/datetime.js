const formatDate = (timestamp, timeZone) => {
  const date = new Date(timestamp)
  const options = {timeZone, year: 'numeric', month: '2-digit', day: '2-digit'}
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date)
  const y = parts.find(p => p.type === 'year').value
  const m = parts.find(p => p.type === 'month').value
  const d = parts.find(p => p.type === 'day').value
  return `${y}-${m}-${d}`
}

const formatTime = (minutes, startDate) => {
  const now = new Date(startDate)
  now.setMinutes(now.getMinutes() + minutes)
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

const getTimestamp = (update) => {
  const now = new Date()
  update(now)
  return now.getTime()
}

const updatedDate = (original, update) => {
  if (!update.split) {
    return update
  }
  const date = new Date(original)
  const args = update?.split('-')
  if (args.length >= 1) {
    date.setFullYear(...args)
    const month = Number.parseInt(args[1], 10)
    if (month >= 1 && month <= 12) {
      date.setMonth(month - 1)
    }
  }
  return date.getTime()
}

const hoursOf = (timestamp, ...args) => {
  const date = new Date(timestamp)
  date.setHours(...args)
  return date.getTime()
}

export {formatDate, formatTime, getTimestamp, hoursOf}
export {updatedDate}
