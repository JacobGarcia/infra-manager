import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { hot } from 'react-hot-loader'

import App from 'containers/App'
import Login from 'containers/Login'

// Redux
import appReducer from 'reducers'
const store = createStore(appReducer)

function Routes() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route path="/" component={App} />
        </Switch>
      </BrowserRouter>
    </Provider>
  )
}

export default hot(module)(Routes)
