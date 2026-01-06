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

const FormattedTime = ({date, timeZone}) => {
  const formatOptions = {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }
  const parts = new Intl.DateTimeFormat('en-US', formatOptions).formatToParts(
    new Date(date),
  )
  const hours = parts.find(p => p.type === 'hour').value
  const minutes = parts.find(p => p.type === 'minute').value
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

// TODO support timezones
const EventCard = ({
  date,
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
      {display.transit === 'before' && <Transit routes={transit} />}
      {display.main && (
        <>
          <div class={css(timeStyle)}>
            <FormattedTime date={date} />
          </div>
          <div class={css(titleStyle)}>{location || '(New)'}</div>
        </>
      )}
      {display.transit === 'after' && <Transit routes={transit} />}
    </div>
  )
}

export default EventCard
