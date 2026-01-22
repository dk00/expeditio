import {css} from '@emotion/css'

const layoutStyle = {
  '@media (orientation: portrait)': {
    '> div:last-of-type': {
      // edit detail, appear from bottom
      position: 'fixed',
      bottom: 0,
      transform: 'translateY(100%)',
      transition: 'transform 0.3s ease-in-out',
    },
  },
  '@media (orientation: landscape)': {
    display: 'flex',
    '> div:first-of-type': {
      flex: '0 0  3rem',
      position: 'sticky',
      top: '1em',
      alignSelf: 'flex-start',
    },
    '> div:nth-of-type(2)': {
      // itinerary, left side
      flex: '0 0 62%',
    },
    '> div:last-of-type': {
      // edit detail, right side
      position: 'sticky',
      top: '5em',
      flex: '1',
      alignSelf: 'flex-start',
    },
  },
}

const editingStyle = {
  '@media (orientation: portrait)': {
    '> div:last-of-type': {
      transform: 'translateY(0)',
    },
  },
}

const Layout = ({editing, children}) => (
  <div class={css(layoutStyle, editing && editingStyle)}>{children}</div>
)

export default Layout
