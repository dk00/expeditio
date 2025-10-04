/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import {css} from '@emotion/css'

const cardStyle = {
  margin: '0.5em',
  padding: '1em',
  border: '3px dashed #666',
  borderRadius: '0.5em',
}

const SuggestedEvent = ({tags, onClick}) => (
  <div class={css(cardStyle)} onClick={onClick}>
    Add {tags[0]}
  </div>
)

export default SuggestedEvent
