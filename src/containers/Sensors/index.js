import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts'
import io from 'socket.io-client'

import { Card, Tooltip, FuelChart } from 'components'
import { NetworkOperation } from 'lib'
import {
  getColor,
  itemAverage,
  itemStatus,
  chartStatus
} from 'lib/specialFunctions'

class Sensors extends Component {
  constructor(props) {
    super(props)

    this.state = {
      users: [],
      isAddingUser: false,
      query: '',
      filteredUsers: [],
      alerts: [],
      latestAlerts: [],
      from: new Date(),
      to: new Date(),
      data: [
        { name: 'workings', value: 100 },
        { name: 'alerts', value: 0 },
        { name: 'damaged', value: 0 }
      ]
    }
  }

  onSites = () => {
    this.props.history.replace(`/sites`)
  }

  componentDidMount() {
    NetworkOperation.getSensors().then(({ data }) => {
      this.setState({
        // Average values for sensor readings
        aperture: parseInt(itemAverage('contact', data.sensors), 10),
        vibration: parseInt(itemAverage('vibration', data.sensors), 10),
        temperature: parseInt(itemAverage('cpu', data.sensors), 10),
        energy: parseInt(itemAverage('battery', data.sensors), 10),
        apertureStatus: itemStatus('contact', data.sensors, 'upscale', 80, 20),
        vibrationStatus: itemStatus(
          'vibration',
          data.sensors,
          'upscale',
          80,
          20
        ),
        temperatureStatus: itemStatus('cpu', data.sensors, 'between', 50, 0),
        ambienceStatus: itemStatus(
          'temperature',
          data.sensors,
          'between',
          40,
          0
        ),
        energyStatus: itemStatus('battery', data.sensors, 'between', 130, 100),
        battery: parseInt(itemAverage('battery', data.sensors), 10),
        fuel: parseInt(itemAverage('fuel', data.sensors), 10),
        status: chartStatus(this.props.reports)
      })
    })
    // Init socket with userId and token
    this.initSocket()
  }

  initSocket() {
    this.socket = io()

    this.socket.on('connect', () => {
      this.socket.emit('join', this.props.credentials.company.name)
    })

    this.socket.on('refresh', () => {
      NetworkOperation.getSensors().then(({ data }) => {
        this.setState({
          // Average value for status
          aperture: parseInt(itemAverage('contact', data.sensors), 10),
          vibration: parseInt(itemAverage('vibration', data.sensors), 10),
          temperature: parseInt(itemAverage('cpu', data.sensors), 10),
          ambience: parseInt(itemAverage('temperature', data.sensors), 10),
          energy: parseInt(itemAverage('battery', data.sensors), 10),
          fuel: parseInt(itemAverage('fuel', data.sensors), 10),
          // Pie charts for every sensor class
          apertureStatus: itemStatus(
            'contact',
            data.sensors,
            'upscale',
            100,
            0
          ),
          vibrationStatus: itemStatus(
            'vibration',
            data.sensors,
            'upscale',
            100,
            0
          ),
          temperatureStatus: itemStatus('cpu', data.sensors, 'between', 50, 0),
          ambienceStatus: itemStatus(
            'temperature',
            data.sensors,
            'between',
            40,
            0
          ),
          energyStatus: itemStatus('battery', data.sensors, 'between', 130, 100)
        })
      })
    })
  }

  render() {
    const {
      state: {
        temperatureStatus,
        vibrationStatus,
        apertureStatus,
        ambienceStatus,
        energyStatus,
        status
      }
    } = this
    return (
      <div className="users app-content small-padding sensors">
        <Helmet>
          <title>Connus | Sensores</title>
        </Helmet>
        <div className="content">
          <h2>Sensorización</h2>
          <div className="overall-container">
            <div className="horizontal-container">
              {this.state.temperature &&
              !this.props.credentials.company.name === 'AT&T' ? (
                <Card
                  title="Temperatura del procesador"
                  className={`graph-container`}>
                  <div className="graph">
                    <PieChart width={160} height={160}>
                      <Pie
                        animationBegin={0}
                        dataKey="value"
                        data={temperatureStatus}
                        cx={75}
                        cy={75}
                        innerRadius={55}
                        outerRadius={75}
                        strokeWidth={0}
                        label>
                        {this.state.data.map(({ name }, index) => (
                          <Cell key={index} fill={getColor(name)} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        isAnimationActive={false}
                        content={Tooltip}
                      />
                    </PieChart>
                    <h1>{this.state.temperature && this.state.temperature}</h1>
                  </div>
                  <div className="center">
                    {temperatureStatus &&
                      (!temperatureStatus[2].value && 'Alertados')}
                    <p className="border button" onClick={this.onSites}>
                      {}
                      sitios
                    </p>
                  </div>
                </Card>
              ) : null}

              {this.state.ambience ? (
                <Card
                  title="Temperatura Ambiente"
                  className={`graph-container`}>
                  <div className="graph">
                    <PieChart width={160} height={160}>
                      <Pie
                        animationBegin={0}
                        dataKey="value"
                        data={ambienceStatus}
                        cx={75}
                        cy={75}
                        innerRadius={55}
                        outerRadius={75}
                        strokeWidth={0}
                        label>
                        {this.state.data.map(({ name }, index) => (
                          <Cell key={index} fill={getColor(name)} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        isAnimationActive={false}
                        content={Tooltip}
                      />
                    </PieChart>
                    <h1>{this.state.ambience && this.state.ambience}</h1>
                  </div>
                  <div className="center">
                    {ambienceStatus &&
                      (!ambienceStatus[2].value && 'Alertados')}
                    <p className="border button" onClick={this.onSites}>
                      {ambienceStatus &&
                        (ambienceStatus[2].value &&
                          ambienceStatus[2].value)}{' '}
                      sitios
                    </p>
                  </div>
                </Card>
              ) : null}

              <Card title="Vibración" className={`graph-container`}>
                <div className="graph">
                  <PieChart width={160} height={160}>
                    <Pie
                      animationBegin={0}
                      dataKey="value"
                      data={vibrationStatus}
                      cx={75}
                      cy={75}
                      innerRadius={55}
                      outerRadius={75}
                      strokeWidth={0}
                      label>
                      {this.state.data.map(({ name }, index) => (
                        <Cell key={index} fill={getColor(name)} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      isAnimationActive={false}
                      content={Tooltip}
                    />
                  </PieChart>
                  <h1>{this.state.vibration && this.state.vibration}</h1>
                </div>
                <div className="center">
                  {vibrationStatus && vibrationStatus.length > 0 && 'Alertados'}

                  <p className="border button warning" onClick={this.onSites}>
                    {status && status.vibration} sitios
                  </p>
                </div>
              </Card>
              <Card title="Apertura" className={`graph-container`}>
                <div className="graph">
                  <PieChart width={160} height={160}>
                    <Pie
                      animationBegin={0}
                      dataKey="value"
                      data={apertureStatus}
                      cx={75}
                      cy={75}
                      innerRadius={55}
                      outerRadius={75}
                      strokeWidth={0}
                      label>
                      {this.state.data.map(({ name }, index) => (
                        <Cell key={index} fill={getColor(name)} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      isAnimationActive={false}
                      content={Tooltip}
                    />
                  </PieChart>
                  <h1>{this.state.aperture}</h1>
                </div>
                <div className="center">
                  {apertureStatus && apertureStatus.length > 0 && 'Alertados'}

                  <p className="border button warning" onClick={this.onSites}>
                    {status && status.contact} sitios
                  </p>
                </div>
              </Card>

              {this.state.energy ? (
                <Card title="Corriente" className={`graph-container`}>
                  <div className="graph">
                    <PieChart width={160} height={160}>
                      <Pie
                        animationBegin={0}
                        dataKey="value"
                        data={this.state.energyStatus}
                        cx={75}
                        cy={75}
                        innerRadius={55}
                        outerRadius={75}
                        strokeWidth={0}
                        label>
                        {this.state.data.map(({ name }, index) => (
                          <Cell key={index} fill={getColor(name)} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        isAnimationActive={false}
                        content={Tooltip}
                      />
                    </PieChart>
                    <h1>{this.state.energy && this.state.energy}</h1>
                  </div>
                  <div className="center">
                    {energyStatus && energyStatus.length > 0 && 'Alertados'}

                    <p className="border button warning" onClick={this.onSites}>
                      {energyStatus && energyStatus[1].value} sitios
                    </p>
                  </div>
                </Card>
              ) : null}
              {this.state.fuel ||
              (this.state.fuel === 0 &&
                !this.props.credentials.company.name === 'AT&T') ? (
                <Card title="Nivel de Combustible">
                  <div>
                    <FuelChart
                      fuel={this.state.fuel}
                      height={160}
                      width={110}
                      percentage={80}
                    />
                  </div>
                  <div className="center">
                    <h3>{this.state.fuel}% promedio</h3>
                    {this.state.fuel &&
                      (!this.state.fuel && 'Ningún sitio dañado')}
                    <p className="border warning button" onClick={this.onSites}>
                      {/* this.state.fuel && (this.state.fuel) */} Sitios
                    </p>
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Sensors.propTypes = {
  credentials: PropTypes.object,
  history: PropTypes.object,
  alarms: PropTypes.array,
  reports: PropTypes.array
}

function mapStateToProps({ zones, credentials, alarms, reports }) {
  return {
    zones,
    credentials,
    alarms,
    reports
  }
}

export default connect(mapStateToProps)(Sensors)
