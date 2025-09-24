import {useState} from 'preact/hooks'
import {css} from '@emotion/css'

const pink = {
  color: 'hotpink',
}

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 class={css(pink)}>expeditio</h1>
      10-25
    </>
  )
}

export default App
