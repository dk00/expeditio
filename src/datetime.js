const formatTime = (minutes, startDate) => {
  const now = new Date(startDate)
  now.setMinutes(now.getMinutes() + minutes)
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export {formatTime}
