import {css} from '@emotion/css'

const styles = {
  button: {
    position: 'relative',
    margin: '0 0.125em',
    padding: '0.5em',
    border: 'none',
    borderRadius: '1em',
    lineHeight: 1.2,
    fontSize: '100%',
    color: '#ccc',
    background: '#333',
    ':after': {
      position: 'absolute',
      right: 0,
      bottom: 0,
      display: 'block',
      width: '1em',
      textAlign: 'center',
      fontSize: '0.7em',
      color: '#fff',
      borderRadius: '1em',
    },
  },
}

const todoStyle = {
  '&:after': {
    content: '"＋"',
    background: '#f59',
  },
}

const checkedStyle = {
  '&:after': {
    content: '"✓"',
    background: '#5a0',
  },
}

const FormattedDate = ({date, timezone}) => {
  const now = new Date(date)
  const month = now.toLocaleDateString('en', {
    month: '2-digit',
    timeZone: timezone,
  })
  const day = now.toLocaleDateString('en', {day: '2-digit', timeZone: timezone})
  const weekday = now.toLocaleDateString('en', {
    weekday: 'short',
    timeZone: timezone,
  })

  return `${month}-${day} ${weekday}`
}

const DayHeader = ({date, timeZone, dailyEvents, onClick}) => (
  <h3 class={css(styles)} data-date={date}>
    <FormattedDate date={date} timezone={timeZone} />
    <button
      type="button"
      onClick={event => onClick(event, dailyEvents.activity)}
    >
      +
    </button>
    <button
      type="button"
      class={css(dailyEvents.breakfast.listIndex ? checkedStyle : todoStyle)}
      onClick={event => onClick(event, dailyEvents.breakfast)}
    >
      🥪
    </button>
    <button
      type="button"
      class={css(dailyEvents.lunch.listIndex ? checkedStyle : todoStyle)}
      onClick={event => onClick(event, dailyEvents.lunch)}
    >
      🍽️
    </button>
    <button
      type="button"
      class={css(dailyEvents.dinner.listIndex ? checkedStyle : todoStyle)}
      onClick={event => onClick(event, dailyEvents.dinner)}
    >
      🍽️
    </button>
    <button
      type="button"
      class={css(
        dailyEvents.accommodation.listIndex ? checkedStyle : todoStyle,
      )}
      onClick={event => onClick(event, dailyEvents.accommodation)}
    >
      🛏
    </button>
  </h3>
)

export default DayHeader
