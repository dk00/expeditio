import {css} from '@emotion/css'

const cardStyle = {
  margin: '0.5em',
  padding: '1em',
  display: 'flex',
  flexWrap: 'wrap',
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
  <div class={css({flex: '0 100%'})}>
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
  tags = [],
  transit,
  ...rest
}) => {
  const display = {
    transit: tags.some(tag => /return/.test(tag))
      ? 'after'
      : transit
        ? 'before'
        : 'none',
    main: tags.some(tag => /departure|return/.test(tag)) || !transit,
  }

  return (
    <div class={css(cardStyle, className)} data-date={date} {...rest}>
      {}
      {display.transit === 'before' && <Transit routes={transit} />}
      {display.main && (
        <>
          <div class={css(timeStyle)}>
            <FormattedTime startDate={startDate} date={date} />
          </div>
          <div class={css(titleStyle)}>{location || '(New)'}</div>
        </>
      )}
      {display.transit === 'after' && <Transit routes={transit} />}
    </div>
  )
}

export default EventCard
