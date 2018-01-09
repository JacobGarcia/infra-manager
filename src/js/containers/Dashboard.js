import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { PieChart, Pie, Cell, AreaChart, XAxis, LineChart, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine, Area, ResponsiveContainer,ComposedChart, YAxis, Bar, Line } from 'recharts'

import { Card } from '../components'
import { yellow, red, blue, darkGray, violet } from '../lib/colors'

const Tooltip = ({payload, label}) => (
  <div className="tooltip">
    <span>{label}</span>
    {
      payload &&
      payload.map((element, index) =>
        <div key={index}>
          <span className="icon" style={{backgroundColor: element.color}} />
          <p>{element.name}: {element.value}</p>
        </div>
      )
    }
  </div>
)

const data = [
  { name: 'workings', value: 96.1 },
  { name: 'alerts', value: 2.8 },
  { name: 'damaged', value: 1.1 }
]

const data2 = [
  { name: '1:00 AM', uv: 590, pv: 1043, tv: 93 },
  { name: '2:00 AM', uv: 868, pv: 940, tv: 40 },
  { name: '3:00 AM', uv: 1397, pv: 1241, tv: 541 },
  { name: '4:00 AM', uv: 1480, pv: 1043, tv: 53 },
  { name: '5:00 AM', uv: 1520, pv: 1204, tv: 14 },
  { name: '6:00 AM', uv: 1400, pv: 1143, tv: 443 },
  { name: '7:00 AM', uv: 1400, pv: 1443, tv: 263 },
  { name: '8:00 AM', uv: 1400, pv: 1143, tv: 583 },
  { name: '9:00 AM', uv: 1400, pv: 1143, tv: 583 },
  { name: '10:00 AM', uv: 400, pv: 1042, tv: 34 },
  { name: '11:00 AM', uv: 1100, pv: 1042, tv: 92 },
  { name: '12:00 PM', uv: 1300, pv: 1042, tv: 43 },
  { name: '1:00 PM', uv: 2400, pv: 1042, tv: 51 }
]

const barData = [
      {name: '1:00 AM', pv: 88 },
      {name: '2:00 AM', pv: 90 },
      {name: '3:00 AM', pv: 78 },
      {name: '4:00 AM', pv: 58 },
      {name: '5:00 AM', pv: 67 },
      {name: '6:00 AM', pv: 74 },
      {name: '7:00 AM', pv: 74 },
      {name: '8:00 AM', pv: 79 },
      {name: '9:00 AM', pv: 80 },
      {name: '10:00 AM', pv: 83 },
      {name: '11:00 AM', pv: 84 },
      {name: '12:00 PM', pv: 85 },
      {name: '1:00 PM', pv: 80 }
]

function getColor(name) {
  switch (name) {
    case 'working': return blue
    case 'alerts': return yellow
    case 'damaged': return red
    default: return blue
  }
}

class Dashboard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selected: 0
    }
  }
  render() {
    const { state, props } = this

    return (
      <div className="dashboard app-content">
        <div className="overall-container">
          <div className="horizontal-container">
            <Card className="graph-container" title="Rendimiento general">
              <div className="graph">
                <PieChart width={200} height={200}>
                  <Pie
                    animationBegin={0}
                    dataKey="value"
                    data={data}
                    cx={95} cy={95}
                    innerRadius={60}
                    outerRadius={95}
                    strokeWidth={0}
                    label
                  >
                    {
                      data.map(({name}, index) =>
                        <Cell key={index} fill={getColor(name)}/>
                      )
                    }
                  </Pie>
                  <RechartsTooltip isAnimationActive={false} content={Tooltip} />
                </PieChart>
              </div>
              <div>
                <h3>Rendimiento general del equipo</h3>
                <p>120 sitios</p>
                <div className="stats">
                  <p><span>96.1%</span> funcionando</p>
                  <p><span>2.8%</span> alertado</p>
                  <p><span>1.1%</span> dañado</p>
                </div>
              </div>
            </Card>
            <Card className="historical" title="Media de servicio">
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={barData}
                  syncId="dashboard"
                  margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                   <XAxis dataKey="name" height={20} mirror axisLine={false} padding={{right: 50}}/>
                   <CartesianGrid stroke="#424953" horizontal={false} strokeWidth={0.5} />
                   <defs>
                    <linearGradient id="colorUv" x1="1" y1="0" x2="0" y2="0">
                      <stop offset="0%" stopColor={blue} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={blue} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <RechartsTooltip isAnimationActive={false} content={Tooltip} />
                   <Area dataKey="pv" fill="url(#colorUv)" animationBegin={0}
                     type="natural" stroke={blue} strokeWidth={2}
                     activeDot={{ stroke: blue, strokeWidth: 2, fill: darkGray }} />
                 <ReferenceLine y={40} stroke="red" strokeDasharray="5 5" />
               </AreaChart>
             </ResponsiveContainer>
            </Card>
          </div>
          <div className="horizontal-container">
            <Card title="Afluencia de personas" className="horizontal">
              <div>
                <h1>105</h1>
                <p>7 personas por hora</p>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <ComposedChart data={data2}
                      syncId="dashboard"
                      margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                    <XAxis dataKey="name" height={15} axisLine={false} tickLine={false} />
                    <YAxis width={21} tickLine={false} />
                    <RechartsTooltip isAnimationActive={false} content={Tooltip} />
                    <Bar dataKey="uv" fill="rgba(255,255,255,0.15)"/>
                    <Line type="linear" dataKey="uv" stroke={blue}
                      strokeWidth={1}
                      dot={{ strokeWidth: 0, fill: blue }}
                      activeDot={{ stroke: blue, strokeWidth: 2, fill: darkGray }} />
                 </ComposedChart>
               </ResponsiveContainer>
            </Card>
            <Card title="Flujo vehicular" className="horizontal">
              <div>
                <h1>210</h1>
                <p>15 vehículos por hora</p>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={data2}
                      syncId="dashboard"
                      margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                    <XAxis dataKey="name" height={15} axisLine={false} tickLine={false} />
                    <YAxis width={21} tickLine={false} />
                    <RechartsTooltip isAnimationActive={false} content={Tooltip} />
                    <Line type="linear" dataKey="uv" stroke={blue}
                      strokeWidth={1}
                      activeDot={{ strokeWidth: 0, fill: blue }}
                      dot={{ stroke: blue, strokeWidth: 2, fill: darkGray }} />
                    <Line type="linear" dataKey="pv" stroke={yellow}
                      strokeWidth={1}
                      activeDot={{ strokeWidth: 0, fill: yellow }}
                      dot={{ stroke: yellow, strokeWidth: 2, fill: darkGray }} />
                    <Line type="linear" dataKey="tv" stroke={violet}
                      strokeWidth={1}
                      activeDot={{ strokeWidth: 0, fill: violet }}
                      dot={{ stroke: violet, strokeWidth: 2, fill: darkGray }} />
                 </LineChart>
               </ResponsiveContainer>
            </Card>
          </div>
          <div className="events-container">
            <ul className="inline-nav">
              <li className={state.selected ? '' : 'active'} onClick={() => this.setState({ selected: 0 })}>Historial de sucesos</li>
              <li className={state.selected ? 'active' : ''} onClick={() => this.setState({ selected: 1 })}>Alertas</li>
            </ul>
            <div className="table">
              <div className="table-header">
                <div className="table-item">
                  <div className="medium">Tiempo</div>
                  <div className="large">Suceso</div>
                  <div>Zona</div>
                  <div>Sitio</div>
                  <div>Riesgo</div>
                  <div className="medium">Acción</div>
                </div>
              </div>
              <div className="table-body">
                {
                  state.selected
                  ?
                  [0,0,0,0,0].map((element, index) =>
                    <div className="table-item" key={index}>
                      <div className="medium">3 enero <span>7:45 AM</span></div>
                      <div className="large">Detección de movimiento</div>
                      <div>Norte</div>
                      <div>45</div>
                      <div>III</div>
                      <div className="medium">Vigilancia</div>
                    </div>
                  )
                  :
                  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].map((element, index) =>
                    <div className="table-item" key={index}>
                      <div className="medium">3 enero <span>7:45 AM</span></div>
                      <div className="large">Detección de movimiento</div>
                      <div>Norte</div>
                      <div>45</div>
                      <div>{index % 3}</div>
                      <div className="medium">Vigilancia</div>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Dashboard.propTypes = {

}

export default Dashboard
