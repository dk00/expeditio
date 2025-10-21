import {useEffect, useState} from 'preact/hooks'

const importData = async sourceUrl => {
  const data = await fetch(sourceUrl).then(res => res.text())
  localStorage.setItem('savedItinerary', data)
}

const Import = () => {
  const sourceUrl = window.location.search.slice(1)
  const [status, setStatus] = useState(sourceUrl ? 'loading' : 'idle')
  useEffect(() => {
    if (!sourceUrl) {
      return
    }
    importData(sourceUrl).then(() => setStatus('ready'))
  }, [sourceUrl])
  const goHome = event => {
    event.preventDefault()
    history.replaceState({}, '', '/')
    window.dispatchEvent(new CustomEvent('popstate'))
  }

  return status === 'idle' ? (
    <div>specify source URL</div>
  ) : status === 'loading' ? (
    <div>loading {sourceUrl}</div>
  ) : (
    <div>
      loaded <a href="/" onClick={goHome}>go back</a>
    </div>
  )

}

export default Import
