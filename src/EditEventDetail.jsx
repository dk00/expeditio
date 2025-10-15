/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
import {css} from '@emotion/css'
import {useEffect, useState} from 'preact/hooks'

const editStyle = {
  position: 'fixed',
  bottom: 0,
  width: '100%',
  background: '#333',
  transform: 'translateY(100%)',
  transition: 'transform 0.3s ease-in-out',
  label: {
    display: 'block',
    padding: '0.5em',
  },
  input: {
    margin: '0 0.5em',
    fontSize: '100%',
  },
}

const editOpenStyle = {
  transform: 'translateY(0)',
}

const editActionsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  background: '#000',

  '> button': {
    flex: '0 0 calc(100% / 3 - 1px)',
    border: 'none',
    borderRadius: 0,
    background: '#555',
    '&:last-of-type': {
      background: '#060',
    },
  },
}

const tagStyle = {
  display: 'flex',
  '> div': {
    margin: '0.2em 0.3em',
    padding: '0.5em 0.5em',
    background: '#222',
    borderRadius: '0.2em',
    '&[aria-checked=true]': {
      background: '#f59',
    }
  }
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
      aria-checked={value.includes('transport')}
      onClick={() => onChange(['transport'])}
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

const EditEventDetail = ({current = {}, onChange, onSave, onCancel}) => {
  const [values, setValues] = useState({})
  const onClickSave = () => onSave(values)
  const onChangeLocation = event => {
    setValues({...values, location: event.target.value})
    onChange(event, {name: 'location', value: event.target.value})
  }
  const onChangeTags = tags => {
    setValues({...values, tags})
    onChange(null, {name: 'tags', value: tags})
  }
  useEffect(() => {
    setValues({
      location: current.location || '',
      date: current.date || '',
      tags: current.tags || [],
    })
  }, [current])

  return (
    <div class={css(editStyle, current.date && editOpenStyle)}>
      <Tags
        value={values.tags}
        onChange={onChangeTags}
      />
      <label>
        Location
        <input type="text" value={values.location} onInput={onChangeLocation} />
      </label>
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
