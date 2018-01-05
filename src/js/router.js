import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { App, Login } from './containers'

// Redux
import appReducer from './reducers'
const store = createStore(appReducer)

function Routes() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Route path="/" component={App}/>
        </Switch>
      </Router>
    </Provider>
  )
}

export default Routes
