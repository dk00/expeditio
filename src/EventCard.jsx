import {css} from '@emotion/css'
import { formatTime } from './datetime'

const cardStyle = {
  margin: '0.5em',
  padding: '1em',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  borderRadius: '0.5em',
  background: '#332',
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
            {formatTime(date)}
          </div>
          <div class={css(titleStyle)}>{location || '(New)'}</div>
        </>
      )}
      {display.transit === 'after' && <Transit routes={transit} />}
    </div>
  )
}

export default EventCard
