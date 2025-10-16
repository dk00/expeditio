const edit = (itinerary, {listIndex, index, ...values}) =>
  (listIndex >= 0
    ? itinerary.slice(0, listIndex).concat(itinerary.slice(listIndex + 1))
    : itinerary
  )
    .concat(values)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

export {edit}
