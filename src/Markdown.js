import { useState } from "react"
import genMarkdown from "./genMarkdown"

const tryLoad = () => {
  try {
    return JSON.parse(localStorage.savedItinerary)
  } catch (e) {}
}

const Markdown = () => {
  const [itinerary] = useState(() => tryLoad())
  const baseDate = itinerary[0]?.baseDate || new Date.toJ
  
  return <pre>
    {genMarkdown(itinerary, {baseDate}).join('\n')}
  </pre>
}

export default Markdown
