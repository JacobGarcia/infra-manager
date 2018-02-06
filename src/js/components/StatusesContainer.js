import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { substractReportValues, getStatus, getFilteredReports } from '../lib/specialFunctions'
import { ElementStatus } from './'
import { NetworkOperation, NetworkOperationFRM } from '../lib'

import io from 'socket.io-client'


// IMPORTANT TODO if we change the site key, re-set the socket or ask to join there
class StatusesContainer extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      show: 'SENSORS',
      photo2: props.photo1,
      photo3: props.photo2
    }

    this.getLink = this.getLink.bind(this)
  }

  componentWillMount(){
    // Init socket with userId and token
    this.initSocket()
  }


  initSocket() {
    this.socket = io('https://connus.be')

    this.socket.on('connect', () => {
      console.log('Connected')
      this.socket.emit('join', 'connus')
    })

    this.socket.on('debugRequest',data => {

      //if (this.props.element.key === camera){
        this.setState({
          photo2 : data.image2,
          photo3 : data.image3
        })
    //  }
    })

  }

  getLink(type, element) {
    const { zoneId, siteId } = this.props.params
    switch (type) {
      case 'GENERAL': return `/sites/${element._id}`
      case 'ZONE': return `/sites/${zoneId}/${element._id}`
      case 'SUBZONE': return `/sites/${zoneId}/${element._id}`
      case 'SITE': return `/sites/${zoneId}/${siteId}`
      default: return `/`
    }
  }

  getElementTitle(type) {
    switch (type) {
      case 'GENERAL': return 'Zona'
      case 'ZONE': return ''
      case 'SITE': return 'Sensor'
      default: return `Otro`
    }
  }

  onDebug(){
    const { props } = this
    NetworkOperationFRM.getDebug(props.element.key)
    .then((response) => {
    console.log(response)
    })
    .catch((error) => {
      console.log(error)
    })
  }

  getContent() {
    const { props, state } = this

    const isSensor = props.type !== 'SITE' ? 'SENSORS' : null

    switch (isSensor || state.show) {
      case 'SENSORS':
      return (
        (props.elements && props.elements.length > 0)
        ?
        props.elements.map(element => {
          let reports = getFilteredReports(props.reports, element)
          reports = substractReportValues(reports)
          let { status, percentage } = getStatus(reports || null)

          if (props.type === 'SITE') {
            const sensor = substractReportValues(props.reports).sensors.find(({key}) => key === element.key)

            if (sensor) {
              status = [{ name: 'normal', value: sensor.value}, { name: 'alerts', value: 100 - sensor.value }]
              percentage = sensor.value
            }
          }

          // const { value = null } = element // Sensors

          return (
            <Link key={element._id} to={this.getLink(props.type, element)}>
              <ElementStatus
                id={element._id}
                title={this.getElementTitle(props.type)}
                name={element.name}
                type={props.type}
                siteKey={element.key}
                percentage={percentage} // Zone
                status={status} // Zone
                alarms={reports ? reports.alarms.length : 0}
                elements={element.elements} // Subzones or sites
                onHover={props.onHover}
                nonPercentage={props.type === 'SITE'}
              />
            </Link>
          )
        })
        :
        <div>
          Sin información
        </div>
      )
      case 'CAMERAS':
      return (
        <div className="action destructive">
          <p onClick={() => this.onDebug() }>Ver Cámaras</p>
          <p>Photo 1</p>
          <img src={this.state.photo2} />
          <br/>
          <p>Photo 2</p>
          <img src={this.state.photo3} />
        </div>

      )
      case 'INFO':
      return (
        (props.element && props.element.position) &&
        <div className="info readonly">
          <div>
            <label htmlFor="">Id</label>
            <input type="text" value={props.element._id} readOnly />
          </div>
          <div>
            <label htmlFor="">Nombre</label>
            <input type="text" value={props.element.name} />
          </div>
          <div>
            <label htmlFor="">KEY</label>
            <input type="text" value={props.element.key} />
          </div>
          <div>
            <label htmlFor="">Ubicación</label>
            <input type="text" value={props.element.address} />
          </div>
          <div>
            <h4>Coordenadas</h4>
            <label htmlFor="">Latitud</label>
            <input type="text" value={props.element.position ? props.element.position[0] : ''} />
            <label htmlFor="">Longitud</label>
            <input type="text" value={props.element.position ? props.element.position[1] : ''} />
          </div>
          <div>
            <h4>Usuarios monitoreando</h4>
          </div>
          <div>
            <label>Notas</label>
            <textarea>{props.element.notes}</textarea>
          </div>
        </div>
      )
      default: return null
    }
  }

  render() {
    const { state, props } = this
    return (
      <div className="statuses-container">
        {
          props.type === 'SITE'
          &&
          <ul className="statuses-container-nav">
            <li onClick={() => this.setState({show: 'SENSORS'})} className={state.show === 'SENSORS' ? 'active' : ''}>Sensores</li>
            <li onClick={() => this.setState({show: 'CAMERAS'})} className={state.show === 'CAMERAS' ? 'active' : ''}>Cámaras</li>
            <li onClick={() => this.setState({show: 'INFO'})} className={state.show === 'INFO' ? 'active' : ''}>Información</li>
          </ul>
        }
        <div className="content">
          {
            this.getContent()
          }
        </div>
      </div>
    )
  }
}

StatusesContainer.propTypes = {
  params: PropTypes.object
}

export default StatusesContainer
