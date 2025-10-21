import {useEffect, useState} from 'react'

import Import from './Import'
import Markdown from './Markdown'
import Plan from './Plan'

const App = () => {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (path === '/export-markdown') {
    return <Markdown />
  }
  if (path === '/import') {
    return <Import />
  }
  return <Plan />
}

export default App
