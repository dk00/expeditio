import {getEdited} from './trip'

const isDate = editing => 'date' in editing.initial || 'date' in editing.changed

const EditForm = ({editing, onChange, onCancel, onSave}) => (
  <form
    autocomplete="off"
    onSubmit={event => {
      event.preventDefault()
      onSave(event, editing)
    }}
  >
    {isDate(editing) ? (
      ['date', 'remark'].map(field => (
        <input
          type={field === 'date' ? 'date' : 'text'}
          name={field}
          defaultValue={
            editing.initial?.[field] || editing.changed?.[field] || ''
          }
          onInput={onChange}
        />
      ))
    ) : (
      <>
        <input
          type="text/"
          name="place"
          defaultValue={editing.initial?.place || editing.changed?.place || ''}
          value={getEdited(editing, 'place')}
          onInput={onChange}
        />
        {('toPlace' in editing.initial || 'toPlace' in editing.changed) && (
          <>
            -
            <input
              type="text"
              name="toPlace"
              defaultValue={
                editing.initial?.toPlace || editing.changed?.toPlace || ''
              }
              onInput={onChange}
            />
            <input
              type="text"
              name="arriveAt"
              defaultValue={
                editing.initial?.arriveAt || editing.changed?.arriveAt || ''
              }
              onInput={onChange}
            />
            <input
              type="text"
              name="note"
              defaultValue={
                editing.initial?.note || editing.changed?.note || ''
              }
              onInput={onChange}
            />
          </>
        )}
      </>
    )}
    <div>
      <button type="submit">✔</button>
      <button type="button" onClick={onCancel}>
        ⬅
      </button>
    </div>
  </form>
)

export default EditForm
