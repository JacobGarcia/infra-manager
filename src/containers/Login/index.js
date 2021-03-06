import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import queryString from 'query-string'
import { Helmet } from 'react-helmet'
import Particles from 'react-particles-js'

import { NetworkOperation } from 'lib'
import { setCredentials } from 'actions'
import * as particleParams from 'lib/particlesjs-config.json'
import logo from 'assets/logo.svg'

class Login extends Component {
  constructor(props) {
    super(props)

    const { return: returnUrl = null } = queryString.parse(location.search)

    this.state = {
      email: '',
      password: '',
      return: returnUrl,
      error: null
    }

    this.onSubmit = this.onSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onChange(event) {
    const { value, name } = event.target

    this.setState({
      [name]: value,
      error: null
    })
  }

  onSubmit(event) {
    event.preventDefault()

    const { email, password } = this.state

    NetworkOperation.login({ email, password })
      .then(({ data }) => {
        localStorage.setItem('token', data.token)

        this.props.setCredentials({ ...data.user, token: data.token })

        this.props.history.replace(this.state.return || '/')
      })
      .catch(({ response = {} }) => {
        const { status = 500 } = response
        switch (status) {
          case 400:
          case 401:
            this.setState({
              error: 'Correo o contraseña incorrectos'
            })
            break
          default:
            this.setState({
              error: 'Problemas al iniciar sesión, intenta nuevamente'
            })
        }
      })
  }

  render() {
    const { state } = this
    return (
      <div className="login">
        <Helmet>
          <title>Connus | Login</title>
        </Helmet>
        <Particles
          style={{
            width: '100%',
            height: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1
          }}
          params={particleParams}
        />
        <div id="logo">
          <img src={logo} alt="Connus" className="iso" />
        </div>
        <form onSubmit={this.onSubmit}>
          <input
            type="text"
            name="email"
            onChange={this.onChange}
            value={state.email}
            placeholder="Usuario"
            required
          />
          <input
            type="password"
            name="password"
            onChange={this.onChange}
            value={state.password}
            placeholder="Contraseña"
            required
          />
          <input
            type="submit"
            value="Iniciar sesión"
            className={`button action ${(!state.email || !state.password) &&
              'disabled'}`}
          />
          {state.error && (
            <div className="error">
              <p>{state.error}</p>
            </div>
          )}
        </form>
      </div>
    )
  }
}

Login.propTypes = {
  setCredentials: PropTypes.func,
  history: PropTypes.object
}

function mapDispatchToProps(dispatch) {
  return {
    setCredentials: user => {
      dispatch(setCredentials(user))
    }
  }
}

export default connect(null, mapDispatchToProps)(Login)
