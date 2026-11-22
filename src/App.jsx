import {useEffect, useState} from 'react'
import Plan from './Plan'

const App = () => {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return <Plan />
}

export default App
