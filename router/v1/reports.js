/* eslint-env node */
const express = require('express')
const path = require('path')
const winston = require('winston')
const router = new express.Router()
const fs = require('fs')
const nodemailer = require('nodemailer')

const Json2csvParser = require('json2csv').Parser

const Site = require(path.resolve('models/Site'))

const fields = [
  {
    label: 'Fecha',
    value: 'date'
  },
  {
    label: 'Hora',
    value: 'hour'
  },
  {
    label: 'Sitio',
    value: 'site'
  },
  {
    label: 'Zona',
    value: 'zone'
  },
  {
    label: 'Key',
    value: 'key'
  },
  {
    label: 'Fotos',
    value: 'photos'
  }
]

const otherFields = [
  {
    label: 'Fecha',
    value: 'date'
  },
  {
    label: 'Hora',
    value: 'hour'
  },
  {
    label: 'Sitio',
    value: 'site'
  },
  {
    label: 'Suceso',
    value: 'event'
  },
  {
    label: 'Zona',
    value: 'zone'
  },
  {
    label: 'Key',
    value: 'key'
  },
  {
    label: 'Fotos',
    value: 'photos'
  }
]

const alarmFields = [
  {
    label: 'Fecha',
    value: 'date'
  },
  {
    label: 'Hora',
    value: 'time'
  },
  {
    label: 'Puerta',
    value: '_id.key'
  },
  {
    label: '# de veces abierta',
    value: 'count'
  }
]

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ingenieria@connus.mx',
    pass: 'kawlantcloud'
  }
})

/* ADD PHOTO MEDIA FILES TO THE SPECIFIED ALARM THAT SERVERS AS EVIDENCE */
router.route('/reports/alarms').get((req, res) => {
  const company = req._user.cmp
  const alarms = []

  Site.find({ company })
    .populate('zone', 'name')
    .select('alarms name zone')
    .exec((error, sites) => {
      if (error) {
        winston.error({ error })
        return res.status(500).json({ error })
      }

      sites.map(site => {
        site.alarms.map(alarm => {
          const currentAlarm = {
            _id: alarm._id,
            event: alarm.event,
            date: new Date(alarm.timestamp).toLocaleDateString(),
            hour: new Date(alarm.timestamp).toLocaleTimeString(),
            site: site.name,
            zone: site.zone.name,
            risk: alarm.risk,
            status: alarm.status,
            key: alarm.key,
            photos: alarm.photos
          }
          alarms.push(currentAlarm)
        })
      })
      const json2csvParser = new Json2csvParser({ fields })
      const csv = json2csvParser.parse(alarms)
      return fs.writeFile('static/alarms.csv', csv, error => {
        if (error) {
          winston.error({ error })
          return res.status(500).json({ error })
        }
        return res.status(200).download('static/alarms.csv')
      })
    })
})

router.route('/reports/alarms/other').get((req, res) => {
  const company = req._user.cmp
  const alarms = []

  Site.find({ company })
    .populate('zone', 'name')
    .select('alarms name zone')
    .exec((error, sites) => {
      if (error) {
        winston.error({ error })
        return res.status(500).json({ error })
      }

      sites.map(site => {
        site.alarms.map(alarm => {
          const currentAlarm = {
            _id: alarm._id,
            event: alarm.event,
            date: new Date(alarm.timestamp).toLocaleDateString(),
            hour: new Date(alarm.timestamp).toLocaleTimeString(),
            site: site.name,
            zone: site.zone.name,
            risk: alarm.risk,
            status: alarm.status,
            key: alarm.key,
            photos: alarm.photos
          }
          alarms.push(currentAlarm)
        })
      })
      const json2csvParser = new Json2csvParser({ fields: otherFields })
      const csv = json2csvParser.parse(alarms)
      return fs.writeFile('static/alarms.csv', csv, error => {
        if (error) {
          winston.error({ error })
          return res.status(500).json({ error })
        }
        return res.status(200).download('static/alarms.csv')
      })
    })
})

/* GET REPORT FILE OF HOW MANY ALARMS PER SENSOR ACTIVATED */
router.route('/reports/alarms/count/:key').get((req, res) => {
  const alarms = []
  const { key } = req.params

  Site.find({ key })
    .populate('zone', 'name')
    .select('alarms name zone')
    .exec((error, sites) => {
      if (error) {
        winston.error({ error })
        return res.status(500).json({ error })
      }

      sites.map(site => {
        site.alarms.map(alarm => {
          const currentAlarm = {
            _id: alarm._id,
            event: alarm.event,
            date: new Date(alarm.timestamp).toLocaleDateString(),
            hour: new Date(alarm.timestamp).toLocaleTimeString(),
            site: site.name,
            zone: site.zone.name,
            risk: alarm.risk,
            status: alarm.status,
            key: alarm.key
          }
          alarms.push(currentAlarm)
        })
      })

      const json2csvParser = new Json2csvParser({ fields })
      const csv = json2csvParser.parse(alarms)
      return fs.writeFile('static/alarms.csv', csv, error => {
        if (error) {
          winston.error({ error })
          return res.status(500).json({ error })
        }

        // Mail options
        const mailOptions = {
          from: 'ingenieria@connus.mx',
          to: 'soporte@connus.mx',
          subject: 'PUMA - Daily Report',
          text: 'This reports contains an attachment in CSV detailing the sensors activations',
          attachments: [
            {
              // filename and content type is derived from path
              path: 'static/alarms.csv'
            }
          ]
        }

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) winston.error(error)
          else winston.info('First email sent: ' + info.response)
        })

        return res.status(200).json({
          success: true,
          message: 'Successfully generated report',
          alarms
        })
      })
    })
})
router.route('/reports/alarms/summery/:key').get((req, res) => {
  const { key } = req.params

  Site.aggregate(
    [
      { $match: { key } },
      { $project: { alarms: 1 } },
      { $unwind: '$alarms' },
      {
        $group: {
          _id: {
            timestamp: {
              $subtract: [
                { $divide: ['$alarms.timestamp', 3600000] },
                { $mod: [{ $divide: ['$alarms.timestamp', 3600000] }, 1] }
              ]
            },
            class: '$alarms.class',
            key: '$alarms.key'
          },
          count: { $sum: 1 }
        }
      }
    ],
    (error, alarms) => {
      if (error) {
        winston.error({ error })
        return res.status(500).json({ error })
      }

      const json2csvParser = new Json2csvParser({ fields: alarmFields })
      alarms.map(alarm => {
        alarm.date = new Date(alarm._id.timestamp * 3600000).toLocaleDateString()
        alarm.time = new Date(alarm._id.timestamp * 3600000).toLocaleTimeString()
      })
      const csv = json2csvParser.parse(alarms)
      return fs.writeFile('static/report.csv', csv, error => {
        if (error) {
          winston.error({ error })
          return res.status(500).json({ error })
        }
        // Mail options
        const mailOptions = {
          from: 'ingenieria@connus.mx',
          to: 'soporte@connus.mx',
          subject: 'PUMA - Daily Report',
          text: 'This reports contains an attachment in CSV detailing the sensors activations',
          attachments: [
            {
              // filename and content type is derived from path
              path: 'static/report.csv'
            }
          ]
        }

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) winston.error(error)
          else winston.info('First email sent: ' + info.response)
        })

        return res.status(200).download('static/report.csv')
      })
    }
  )
})
module.exports = router
