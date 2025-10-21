/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
import {css} from '@emotion/css'
import {useEffect, useState} from 'preact/hooks'
import {addRoute, editTransit, getTransitUrl} from './transit'

const tagStyle = {
  display: 'flex',
  '> div': {
    margin: '0.2em 0.3em',
    padding: '0.5em 0.5em',
    background: '#222',
    borderRadius: '0.2em',
    '&[aria-checked=true]': {
      background: '#f59',
    },
  },
}

const Tags = ({value = [], onChange}) => (
  <div class={css(tagStyle)}>
    <div
      aria-checked={value.includes('event')}
      onClick={() => onChange(['event'])}
    >
      ⭐️
    </div>
    <div
      aria-checked={value.includes('breakfast')}
      onClick={() => onChange(['breakfast'])}
    >
      🥪
    </div>
    <div
      aria-checked={value.includes('lunch')}
      onClick={() => onChange(['lunch'])}
    >
      🍽️
    </div>
    <div
      aria-checked={value.includes('dinner')}
      onClick={() => onChange(['dinner'])}
    >
      🍽️
    </div>
    <div
      aria-checked={value.includes('accommodation')}
      onClick={() => onChange(['accommodation'])}
    >
      🏨
    </div>
    <div
      aria-checked={value.includes('transit')}
      onClick={() => onChange(['transit'])}
    >
      🚃
    </div>
    <div
      aria-checked={value.includes('departure')}
      onClick={() => onChange(['departure'])}
    >
      🛫
    </div>
    <div
      aria-checked={value.includes('return')}
      onClick={() => onChange(['return'])}
    >
      🛬
    </div>
  </div>
)

const transitStyle = {
  margin: '0.5em',
  '> div': {
    display: 'flex',
    alignItems: 'center',
    input: {
      margin: '0.5em 0',
      padding: '0.3em',
      flex: '1',
      fontSize: '100%',
    },
    a: {
      margin: '0 0.5em',
      textDecoration: 'none',
    }
  }
}

const EditTransit = ({startDate, date, routes = [], onChange, onAdd}) => (
  <div class={css(transitStyle)}>
    <button type="button" onClick={onAdd}>
      + route
    </button>
    {routes.map((route, index) => (
      <div>
        <input
          type="text"
          onInput={event => onChange(event, index)}
          value={route}
        />
        <a href={getTransitUrl({startDate, date, route})} target="_blank">
          🔍
        </a>
      </div>
    ))}
  </div>
)

const editStyle = {
  width: '100%',
  background: '#333',
  label: {
    padding: '0.5em',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    margin: '0 0.5em',
    flex: '1',    
  },
  '> button': {
    margin: '0.5em',
    padding: '0.5em',
  },
}

const editActionsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  background: '#000',

  '> button': {
    flex: '0 0 calc(100% / 3 - 1px)',
    border: 'none',
    borderRadius: 0,
    fontSize: '150%',
    background: '#555',
    '&:last-of-type': {
      background: '#060',
    },
  },
}

const EditEventDetail = ({
  startDate,
  current = {},
  onChange,
  onPlanTransit,
  onSave,
  onCancel,
}) => {
  const [values, setValues] = useState({})
  const onClickSave = () => onSave(values)
  const onChangeLocation = event => {
    setValues(state => ({...state, location: event.target.value}))
    onChange(event, {name: 'location', value: event.target.value})
  }
  const onChangeTags = tags => {
    setValues(state => ({...state, tags}))
    onChange(null, {name: 'tags', value: tags})
  }
  const onChangeTransit = (event, index) => {
    const value = editTransit(event, values.transit, index)
    setValues(state => ({...state, transit: value}))
    onChange(event, {name: 'transit', value})
  }
  const onAddRoute = event =>
    onChange(event, {
      name: 'transit',
      value: addRoute(event, values.transit, current),
    })

  useEffect(() => {
    setValues({
      location: current.location || '',
      date: current.date || '',
      tags: current.tags || [],
      transit: current.transit,
    })
  }, [current])

  return (
    <div class={css(editStyle)}>
      <label>
        Location
        <input type="text" value={values.location} onInput={onChangeLocation} />
      </label>
      <Tags value={values.tags} onChange={onChangeTags} />
      {values.transit ? (
        <EditTransit
          startDate={startDate}
          date={current.date}
          routes={values.transit}
          onAdd={onAddRoute}
          onChange={onChangeTransit}
        />
      ) : (
        <button type="button" onClick={() => onPlanTransit()}>
          plan transit
        </button>
      )}
      <div class={css(editActionsStyle)}>
        <button type="button" onClick={onCancel}>
          ⬅
        </button>
        <button type="button">📥</button>
        <button type="button" onClick={onClickSave}>
          ✅
        </button>
      </div>
    </div>
  )
}

export default EditEventDetail
