import React from 'react'
import ReactDOM from 'react-dom'

import Routes from 'router'

// Styles
import 'styles/master.scss'
import 'styles/videojs.scss'

ReactDOM.render(<Routes />, document.getElementById('root'))

// Progressive Web App service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.warn('SW registration failed: ', registrationError)
      })
  })
}
