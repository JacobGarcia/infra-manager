import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

import Table from 'components/Table'
import RiskBar from 'components/RiskBar'

class Accesses extends Component {
  static propTypes = {
    accessReports: PropTypes.array
  }

  state = {
    selectedLog:
      this.props.accessReports.length > 0 ? this.props.accessReports[0] : null,
    selectedElementIndex:
      this.props.accessReports.length > 0 ? [0, 0] : [null, null],
    showLogDetail: true,
    from: new Date(),
    to: new Date()
  }

  onLogSelect(item, index, sectionIndex) {
    this.setState({
      showLogDetail: true,
      selectedLog: item,
      selectedElementIndex: [index, sectionIndex]
    })
  }

  render() {
    const { state, props } = this

    return (
      <div className="app-content accesses small-padding">
        <Helmet>
          <title>Connus | Accesos</title>
        </Helmet>
        <div className="content">
          <h2>Accesos</h2>
          <div className="tables-detail__container">
            <div
              className={`log-detail-container ${
                state.showLogDetail ? '' : 'hidden'
              }`}>
              <div className="content">
                <span
                  onClick={() =>
                    this.setState({
                      showLogDetail: false,
                      selectedElementIndex: [null, null]
                    })
                  }
                  className="close">
                  Cerrar
                </span>
                <div className="time-location">
                  <p>
                    {state.selectedLog.timestamp &&
                      `${state.selectedLog.timestamp.toLocaleDateString(
                        'es-MX'
                      )} ${state.selectedLog.timestamp.toLocaleTimeString()}`}
                  </p>
                  <p>
                    Zona <span>{state.selectedLog.zone.name}</span> Sitio{' '}
                    <span>{state.selectedLog.site}</span>
                  </p>
                </div>
                <div className="detail">
                  <span>Rostro detectado</span>
                  <div
                    className="image-slider"
                    style={{
                      backgroundImage: `url(` + state.selectedLog.photo + `)`
                    }}
                  />
                </div>
                <div className="details-container">
                  <div className="detail">
                    <span>Hora del suceso</span>
                    <p>{state.selectedLog.timestamp.toLocaleTimeString()}</p>
                  </div>
                  <div className="detail">
                    <span>Tipo de acceso</span>
                    <p>{state.selectedLog.access}</p>
                  </div>
                  <div className="detail">
                    <span>Usuario Que Autoriza</span>
                    <p>{state.selectedLog.authorized}</p>
                  </div>
                  <div className="detail">
                    <span>Estatus</span>
                    <p>{state.selectedLog.status}</p>
                  </div>
                  <div className="detail">
                    <span>Código único de identificación</span>
                    <p>{state.selectedLog.id}</p>
                    {/* <img src="" alt=""/> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="tables-container">
              <Table
                className={`${state.showLogDetail ? 'detailed' : ''}`}
                selectedElementIndex={state.selectedElementIndex}
                element={(item, index, sectionIndex) => (
                  <div
                    className={`table-item ${
                      state.selectedElementIndex[0] === index &&
                      state.selectedElementIndex[1] === sectionIndex
                        ? 'selected'
                        : ''
                    }`}
                    key={index}
                    onClick={() => this.onLogSelect(item, index, sectionIndex)}>
                    <div className="medium">
                      {item.timestamp &&
                        `${item.timestamp.toLocaleDateString(
                          'es-MX'
                        )} ${item.timestamp.toLocaleTimeString()}`}
                    </div>
                    <div className="medium bold">{item.event}</div>
                    <div className="hiddable">{item.site}</div>
                    <div className="medium hiddable">{item.status}</div>
                  </div>
                )}
                title="Registros"
                elements={props.accessReports.filter($0 => $0.risk < 1)}
                titles={[
                  { title: 'Tiempo', className: 'medium' },
                  { title: 'Suceso', className: 'medium' },
                  { title: 'Sitio', className: 'hiddable' },
                  { title: 'Estatus o acción', className: 'medium hiddable' }
                ]}
              />
              <Table
                className={`${state.showLogDetail ? 'detailed' : ''}`}
                selectedElementIndex={state.selectedElementIndex}
                element={(item, index) => (
                  <div
                    className={`table-item ${
                      state.selectedElementIndex[0] === index &&
                      state.selectedElementIndex[1] === 1
                        ? 'selected'
                        : ''
                    }`}
                    key={index}
                    onClick={() => this.onLogSelect(item, index, 1)}>
                    <div className="medium">
                      {item.timestamp &&
                        `${item.timestamp.toLocaleDateString(
                          'es-MX'
                        )} ${item.timestamp.toLocaleTimeString()}`}
                    </div>
                    <div className="medium bold">{item.event}</div>
                    <div className="hiddable">{item.site}</div>
                    <div>
                      <RiskBar risk={item.risk} />
                    </div>
                    <div className="medium hiddable">{item.status}</div>
                  </div>
                )}
                title="Alertas"
                elements={props.accessReports.filter($0 => $0.risk >= 1)}
                titles={[
                  { title: 'Tiempo', className: 'medium' },
                  { title: 'Suceso', className: 'medium' },
                  { title: 'Sitio', className: 'hiddable' },
                  { title: 'Riesgo' },
                  { title: 'Estatus o acción', className: 'medium hiddable' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({ accessReports }) {
  return {
    accessReports
  }
}

export default connect(mapStateToProps)(Accesses)
