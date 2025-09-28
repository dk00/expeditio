import {css} from '@emotion/css'
import {useEffect, useRef, useState} from 'preact/hooks'

import EventCard from './EventCard'
import {edit as editItinerary} from './itinerary'
import mock from './mock'
import SuggestedEvent from './SuggestedEvent'

const endOfDay = date => {
	const now = new Date(date)
	now.setHours(23, 59, 59, 999)

	return now.toJSON()
}

const nextDay = date => {
	if (!date) return
	const now = new Date(date)
	now.setDate(now.getDate() + 1)

	return now.toJSON()
}

const timeOfDay = (date, time) => {
	const [hours, minutes] = time.split(':')
	const now = new Date(date)
	now.setHours(hours, minutes, 0, 0)
	return now.toJSON()
}

const arrivalTime = ({date, duration}) => {
	const now = new Date(date)
	now.setMinutes(now.getMinutes() + duration)
	return now.toJSON()
}

const fillItineraryDays = (dayList, date) => {
	if (!dayList.length) {
		return [{date: endOfDay(date), items: []}]
	}
	const lastDate = dayList.at(-1)?.date
	return date <= lastDate
		? dayList
		: fillItineraryDays(
				dayList.concat({date: nextDay(lastDate), items: []}),
				date,
			)
}

// assume itinerary is sorted by date
const getDailyItinerary = itinerary => {
	// TODO timzone for start date
	const startDate = new Date(itinerary[0].date)

	return itinerary.reduce((last, item) => {
		const dayList = fillItineraryDays(last, item.date)
		const currentDay = dayList.at(-1)
		currentDay.items = currentDay.items.concat(item)
		return dayList
	}, [])
}

const suggestEssentials = (items, current) => {
	const times = items.reduce((result, item) => {
		const tags = item.tags || []
		if (tags.includes('departure')) {
			result.start = arrivalTime(item)
		}
		const meal = tags.find(tag => /breakfast|lunch|dinner/.test(tag))
		if (meal) {
			result[meal] = item.date
		}
		if (tags.includes('return')) {
			result.end = item.date
		}
		return result
	}, {})

	const essentials = [
		{date: timeOfDay(current, '05:00'), tags: ['breakfast']},
		{date: timeOfDay(current, '12:00'), tags: ['lunch']},
		{date: timeOfDay(current, '19:00'), tags: ['dinner']},
		{date: timeOfDay(current, '23:00'), tags: ['accommodation']},
	].filter(
		item =>
			!times[item.tags[0]] &&
			!(item.date < times.start) &&
			!(item.date > times.end),
	)

	return essentials.concat(items).sort((a, b) => a.date.localeCompare(b.date))
}

const getFilledItinerary = itinerary =>
	getDailyItinerary(itinerary).reduce((last, day) => {
		const items = suggestEssentials(day.items, day.date)
		return last.concat({type: 'head', date: day.date}, items)
	}, [])

const FormattedDate = ({date}) => {
	const now = new Date(date)
	return `${now.getMonth() + 1}-${now.getDate()}`
}

const Itinerary = ({items, replaceIndex, replaceItem, onEdit, onCreate}) => (
	<div class={css({h3: {margin: 0, padding: '0.5em'}})}>
		{items.map((item, index) =>
			item.type === 'head' ? (
				<h3>
					<FormattedDate date={item.date} />
				</h3>
			) : index === replaceIndex ? (
				replaceItem
			) : item.location ? (
				<EventCard {...item} onClick={() => onEdit(item, index)} />
			) : (
				<SuggestedEvent {...item} onClick={() => onCreate(item, index)} />
			),
		)}
	</div>
)

const editStyle = {
	position: 'fixed',
	bottom: 0,
	width: '100%',
	background: '#333',
	transform: 'translateY(100%)',
	transition: 'transform 0.3s ease-in-out',
}

const editOpenStyle = {
	transform: 'translateY(0)',
	label: {
		display: 'block',
		padding: '0.5em',
	},
	input: {
		margin: '0 0.5em',
		fontSize: '100%',
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

const editingStyle = {
	touchAction: 'none',
}

const EditingEvent = ({value: {date, location}, onChange}) => {
	const [position, setPosition] = useState('')
	const ref = useRef({})
	const handleDrag = event => {
		event.preventDefault()
		event.target.setPointerCapture(event.pointerId)
		ref.current.startY = event.clientY - (position.y || 0)
	}
	const handleMove = event => {
		if (!event.target.hasPointerCapture(event.pointerId)) {
			return
		}
		setPosition({y: event.clientY - ref.current.startY})
	}
	const handleRelease = event => {
		event.target.releasePointerCapture(event.pointerId)
	}

	return (
		<EventCard
			class={css(editingStyle, {transform: `translateY(${position.y || 0}px)`})}
			date={date}
			location={location}
			onPointerDown={handleDrag}
			onPointerMove={handleMove}
			onPointerUp={handleRelease}
		/>
	)
}

const App = () => {
	const [itinerary, setItinerary] = useState(mock)
	const [editingItem, setEditingItem] = useState({})
	const filledItinerary = getFilledItinerary(itinerary)

	const onCreate = (item, index) => {
		console.log('create', item)
		setEditingItem({...item, index})
	}
	const onEdit = (item, index) => {
		console.log('edit', item, index)
		setEditingItem({...item, index})
	}
	const onChange = (_event, {name, value}) =>
		setEditingItem({...editingItem, [name]: value})

	const onCancel = () => setEditingItem({})
	const onSave = values => {
		console.log('save', values)
		setEditingItem({})
		setItinerary(editItinerary(itinerary, {...editingItem, ...values}))
	}

	return (
		<div>
			<Itinerary
				items={filledItinerary}
				replaceIndex={editingItem.index}
				replaceItem={
					editingItem.date && (
						<EditingEvent value={editingItem} onChange={onChange} />
					)
				}
				onCreate={onCreate}
				onEdit={onEdit}
			/>
			<EditEventDetail
				current={editingItem}
				onChange={onChange}
				onCancel={onCancel}
				onSave={onSave}
			/>
		</div>
	)
}

export default App
