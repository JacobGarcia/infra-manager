import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { PieChart, Pie, Cell } from 'recharts'

function colors(value) {
  if (value > 75) {
    return '#00adee'
  } else if (value < 40) {
    return '#ed2a20'
  }
  return '#FFC511'
}

class ElementStatus extends Component {
  shouldComponentUpdate(nextProps) {
    // This enables the animation
    if (this.props.percentage !== nextProps.percentage) return true
    if (this.props.type !== nextProps.type) return true
    return false
  }

  render() {
    const { props } = this
    let percentage = ''
    console.log('online', props.elements)
    if (props.type === 'ZONE') {
      if (props.isOnline) percentage = props.percentage
      else percentage = 'OFF'
    } else percentage = props.percentage
    if (percentage !== 'OFF' && isNaN(percentage)) percentage = 100
    return (
      <div
        className="status list"
        onMouseOver={() => props.onHover(props.id)}
        onMouseOut={() => props.onHover(null)}
      >
        <div className="status-text">
          <span className="main">
            {props.title} {props.name} <span> {props.siteKey}</span>
          </span>
          {props.type === 'GENERAL' && <span>{props.elements} Sitios</span>}
          {props.type === 'ZONE' && <span>{props.elements} Sensores</span>}
          <span>{props.alarms} Alertas</span>
        </div>
        <div className="chart-container">
          <p>
            {percentage}
            {!props.nonPercentage && percentage !== 'OFF' && '%'}
          </p>
          <PieChart width={70} height={70}>
            <Pie
              dataKey="value"
              data={props.status}
              outerRadius={35}
              innerRadius={28}
              startAngle={props.type === 'SITE' ? -45 : -90}
              endAngle={props.type === 'SITE' ? 225 : 270}
              fill=""
              animationEase="ease"
              animationDuration={500}
              animationBegin={0}
              strokeWidth={0}
            >
              <Cell fill={props.isOnline ? colors(percentage) : colors(0)} />
              <Cell fill="#303640" />
            </Pie>
          </PieChart>
        </div>
      </div>
    )
  }
}

ElementStatus.defaultProps = {
  onHover: () => {}
}

ElementStatus.propTypes = {
  onHover: PropTypes.func,
  title: PropTypes.string,
  elements: PropTypes.number,
  alarms: PropTypes.number,
  name: PropTypes.string,
  siteKey: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  status: PropTypes.array,
  percentage: PropTypes.number
}

export default ElementStatus
