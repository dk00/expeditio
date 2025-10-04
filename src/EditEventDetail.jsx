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

const EditEventDetail = ({current = {}, onChange, onSave, onCancel}) => {
  const [values, setValues] = useState({})
  const onClickSave = () => onSave(values)
  const onChangeLocation = event => {
    setValues({...values, location: event.target.value})
    onChange(event, {name: 'location', value: event.target.value})
  }
  useEffect(() => {
    setValues({
      location: current.location || '',
      date: current.date || '',
    })
  }, [current])

  return (
    <div class={css(editStyle, current.date && editOpenStyle)}>
      <label>
        Location
        <input type="text" value={values.location} onInput={onChangeLocation} />
      </label>
      <div class={css(editActionsStyle)}>
        <button type="button" onClick={onCancel}>
          ↩️
        </button>
        <button type="button">✨</button>
        <button type="button" onClick={onClickSave}>
          ✅
        </button>
      </div>
    </div>
  )
}

export default EditEventDetail
