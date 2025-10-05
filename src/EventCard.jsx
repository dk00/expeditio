import {css} from '@emotion/css'

const cardStyle = {
  margin: '0.5em',
  padding: '1em',
  borderRadius: '0.5em',
  background: '#332',
}

const FormattedTime = ({startDate, date}) => {
	const actualDate = startDate && new Date(startDate)
	actualDate.setMinutes(actualDate.getMinutes() + date)
  const now = date.length ? new Date(date) : actualDate
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const timeStyle = {
  color: '#f59',
}

const titleStyle = {
  lineHeight: '1.3',
  fontSize: '1.1em',
  fontWeight: 'bold',
}

const EventCard = ({
  date,
	startDate,
  class: className,
  location,
  duration,
  destination,
  flight,
  ...rest
}) => {
  const localDate = new Date(date).toDateString()

  return (
    <div class={css(cardStyle, className)} data-date={date} {...rest}>
      <div class={css(timeStyle)}>
        <FormattedTime startDate={startDate} date={date} />
      </div>
      <div class={css(titleStyle)}>{location || '(New)'}</div>
    </div>
  )
}

export default EventCard
