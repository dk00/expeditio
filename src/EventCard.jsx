import {css} from '@emotion/css'
import {formatTime} from './datetime'

const cardStyle = {
  margin: '0.5em',
  padding: '1em',
  minWidth: '0',
  maxWidth: 'calc(100vw - 2em)',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  borderRadius: '0.5em',
  background: '#332',
}

const timeStyle = {
  color: '#f59',
  fontSize: '1.1em',
}

const titleStyle = {
  margin: '0 0.25em',
  flex: '0 1 82%',
  fontSize: '120%',
  fontWeight: 'bold',
  '> span:not(:empty)': {
    margin: '0 0.25em',
  }
}

const Transit = ({routes}) => (
  <div class={css({flex: '0 100%'})}>
    {routes.map(route => (
      <div>{route}</div>
    ))}
  </div>
)

const TagIcon = ({tags = []}) => (
  <span>
    {tags.includes('breakfast')
      ? '🥪'
      : tags.includes('lunch') || tags.includes('dinner')
        ? '🍽️'
        : tags.includes('accommodation')
          ? '🏨'
          : ''}
  </span>
)

// TODO support timezones
const EventCard = ({
  date,
  timeZone,
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
          <div class={css(timeStyle)}>{formatTime(date, {timeZone})}</div>
          <div class={css(titleStyle)}>
            <TagIcon tags={tags} />
            {location || '(New)'}
          </div>
        </>
      )}
      {display.transit === 'after' && <Transit routes={transit} />}
    </div>
  )
}

export default EventCard
