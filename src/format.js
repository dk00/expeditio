const parseWrap = input =>
  input
    .split(/\*\*((?:\d{4}-|\d{2}-)?\d{2}-\d{2})(?:\s+([^*]+))?\*\*/)
    .flatMap((part, i, arr) => {
      if (i % 3 === 0) return part.trim() || []
      if (i % 3 === 1) return { date: part, remark: (arr[i + 1] ?? '').trim() }
      return []
    })

const scheduleKeys = [
  'time',
  'type',
  'place',
  'toPlace',
  'arriveAt',
  'info',
  'note',
]

const schedulePattern = new RegExp(
  [
    /^(\d{2}:\d{2})\s+/, // 1. time
    /(?:([^\p{L}\p{N}\s]+)\s+)?/, // 2. type
    /(.+?)/, // 3. place
    /(?:\s+(?:-|->|→)\s+(.+?)(?:\s+(\d{2}:\d{2})(?:\s+(.+))?)?)?/, // 4. toPlace, 5. arriveAt, 6. info
    /((?:\r?\n(?!\d{2}:\d{2}\b).*)*)$/, // 7. note
  ]
    .map(r => r.source)
    .join(''),
  'gmu',
)

const parseSchedule = input =>
  [...input.trim().matchAll(schedulePattern)].map(match =>
    Object.fromEntries(
      scheduleKeys
        .map((key, i) => [key, match[i + 1]?.trim()])
        .filter(([, val]) => val),
    ),
  )

const parsePlan = content => {
  console.log(
    'Parsing plan:',
    parseWrap(content),
    parseWrap(content).flatMap(item =>
      item.date ? item : parseSchedule(item),
    ),
  )
  return parseWrap(content).flatMap(item =>
    item.date ? item : parseSchedule(item),
  )
}

const formatSchedule = ({time, type, place, toPlace, arriveAt, info, note}) => {
  const head = [
    time,
    type,
    place,
    ...(toPlace ? ['-', toPlace, ...(arriveAt ? [arriveAt, info] : [])] : []),
  ]
    .filter(Boolean)
    .join(' ')

  return note ? `${head}\n${note}` : head
}

const formatPlan = entries =>
  entries
    .flatMap(info =>
      info.date
        ? `**${[info.date, info.remark].filter(Boolean).join(' ')}**`
        : formatSchedule(info),
    )
    .join('\n')

export {parsePlan, formatPlan}
