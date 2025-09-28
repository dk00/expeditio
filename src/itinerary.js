const edit = (itinerary, {index, ...values}) =>
	(index >= 0
		? itinerary.slice(0, index).concat(itinerary.slice(index + 1))
		: itinerary
	)
		.concat(values)
		.sort((a, b) => new Date(a.date) - new Date(b.date))

export {edit}
