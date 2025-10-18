const dateTypeArrival = 4

const getTransitUrl = ({from, to, arrival}) => {
  const dateObject = new Date(arrival)
  const minutes = dateObject.getMinutes().toString().padStart(2, '0')
  const params = {
    from,
    to,
    type: dateTypeArrival,
    y: dateObject.getFullYear(),
    m: dateObject.getMonth() + 1,
    d: dateObject.getDate(),
    hh: dateObject.getHours(),
    m1: minutes[0],
    m2: minutes[1],
    shin: 1,
    ex: 1,
    hb: 1,
    lb: 1,
    sr: 1,
  }
  const searchParams = new URLSearchParams(Object.entries(params))
    
  return `https://transit.yahoo.co.jp/search/result?${searchParams.toString()}`
}

export {getTransitUrl}
