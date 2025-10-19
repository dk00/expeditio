import {css} from '@emotion/css'

const cardStyle = {
  margin: '0.5em',
  padding: '1em',
  display: 'flex',
  alignItems: 'center',
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
  margin: '0 0.5em',
  fontSize: '120%',
  fontWeight: 'bold',
}

const Transit = ({routes}) => (
  <div>
    {routes.map(route => (
      <div>{route}</div>
    ))}
  </div>
)

const EventCard = ({
  date,
  startDate,
  class: className,
  location,
  duration,
  destination,
  flight,
  transit,
  ...rest
}) => {
  const localDate = new Date(date).toDateString()

  return (
    <div class={css(cardStyle, className)} data-date={date} {...rest}>
      {transit ? (
        <Transit routes={transit} />
      ) : (
        <>
          <div class={css(timeStyle)}>
            <FormattedTime startDate={startDate} date={date} />
          </div>
          <div class={css(titleStyle)}>{location || '(New)'}</div>
        </>
      )}
    </div>
  )
}

export default EventCard
