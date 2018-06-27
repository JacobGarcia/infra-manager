/* eslint-env node */
const express = require('express')
const path = require('path')
const winston = require('winston')
const router = new express.Router()

// const Site = require(path.resolve('models/Site'))
// const Zone = require(path.resolve('models/Zone'))
const base64Img = require('base64-img')
const shortid = require('shortid')
const Battery = require(path.resolve('models/Battery'))
const Site = require(path.resolve('models/Site'))
const Report = require(path.resolve('models/Report'))
const Access = require(path.resolve('models/Access'))
const Face = require(path.resolve('models/Face'))
const Admin = require(path.resolve('models/Admin'))

// Return all logs from specific site
router.route('/cameras/logs/:camera').get((req, res) => {
  const camera = req.params.camera

  // Find battery logs
  Battery.find({ camera }).exec((error, batteryLogs) => {
    if (error) {
      winston.error(error)
      return res
        .status(500)
        .json({ success: 'false', message: 'Could not retrieve battery log.' })
    }

    // Find Report logs
    return Report.find({ camera }).exec((error, reportLogs) => {
      if (error) {
        winston.error(error)
        return res
          .status(500)
          .json({ success: 'false', message: 'Could not retrieve report log.' })
      }

      // Find access logs
      return Access.find({ camera }).exec((error, accessLogs) => {
        if (error) {
          winston.error(error)
          return res.status(500).json({
            success: 'false',
            message: 'Could not retrieve battery log.'
          })
        }

        return res
          .status(200)
          .json({ success: true, batteryLogs, reportLogs, accessLogs })
      })
    })
  })
})

// Return last status only for report
// Return last status of access only (to know if the user is valid or not)
router.route('/cameras/report/shit/:site').get((req, res) => {
  const camera = req.params.site

  // Find battery logs
  Report.find({ camera }).exec((error, reportLogs) => {
    if (error) {
      winston.error(error)
      return res
        .status(500)
        .json({ success: 'false', message: 'Could not retrieve report log.' })
    }
    if (!reportLogs) return res.status(404).json({
        success: false,
        message: 'The camera specified does not exists'
      })

    // order logs from most recent access to return the first element. Sync call, so no problem for the return
    reportLogs.sort(($0, $1) => {
      return parseFloat($1.timestamp) - parseFloat($0.timestamp)
    })
    return res.status(200).json({ success: true, report: reportLogs[0] })
    // return res.status(200).json( { 'success': true } ,reportLogs[0] )
  })
})

// Upgrade all cameras
router.route('/cameras/multi/upgrade').post(() => {
  // Admin.findOne({ '_id': req.U_ID })
  // .exec((error, admin) => {
  //   if (error) {
  //     winston.error(error)
  //     return res.status(400).json({'success': "false", 'message': "The specified admin does not exist"})
  //   }
  //   else if (admin.role != 'root') return res.status(401).json({'success': false, 'message': "Get outta here you fucking hacker!"})
  //   else {
  // Notify to cameras
  global.io.emit('upgrade')
  //   return res.status(200).json({ 'succes': true, 'message': "Initiated upgrading process to all cameras" })
  // }
  // })
})

// Get a debug report for all cameras
router.route('/cameras/multi/debug').post((req, res) => {
  Admin.findOne({ _id: req.U_ID }).exec((error, admin) => {
    if (error) {
      winston.error(error)
      return res.status(400).json({
        success: 'false',
        message: 'The specified admin does not exist'
      })
    } else if (admin.role !== 'root') return res
        .status(401)
        .json({ success: false, message: 'Get outta here you fucking hacker!' })

    // Notify to all cameras
    global.io.emit('debug')
    return res.status(200).json({
      succes: true,
      message: 'Initiated debugging process to all cameras'
    })
  })
})

// Get a debug report for all cameras
router.route('/cameras/single/debug').post((req, res) => {
  const { camera } = req.body
  // Notify to all cameras
  global.io.to(camera).emit('debug')
  return res.status(200).json({
    succes: true,
    message: 'Initiated debugging process to all cameras'
  })
})

router.route('/cameras/single/upgrade').post((req, res) => {
  const { camera, site } = req.body
  Admin.findOne({ _id: req.U_ID }).exec((error, admin) => {
    if (error) {
      winston.error(error)
      return res.status(400).json({
        success: 'false',
        message: 'The specified admin does not exist'
      })
    } else if (admin.role !== 'root') return res
        .status(401)
        .json({ success: false, message: 'Get outta here you fucking hacker!' })

    // Notify to cameras
    global.io.to(camera).emit('upgrade', site)
    return res.status(200).json({
      succes: true,
      message: 'Initiated upgrading process to camera ' + camera
    })
  })
})

// Deactivate alarm
router.route('/cameras/alarm/deactivate').post((req, res) => {
  const { camera } = req.body
  Admin.findOne({ _id: req.U_ID }).exec((error, admin) => {
    if (error) {
      winston.error(error)
      return res.status(400).json({
        success: 'false',
        message: 'The specified admin does not exist'
      })
    } else if (admin.role !== 'root') return res
        .status(401)
        .json({ success: false, message: 'Get outta here you fucking hacker!' })

    // Notify to cameras
    global.io.to(camera).emit('deactivate')
    return res.status(200).json({
      succes: true,
      message: 'Deactivated alarm for camera ' + camera
    })
  })
})

// Ask for more alarm photos
router.route('/cameras/alarm/photos/activate').post((req, res) => {
  const { camera } = req.body
  Admin.findOne({ _id: req.U_ID }).exec((error, admin) => {
    if (error) {
      winston.error(error)
      return res.status(400).json({
        success: 'false',
        message: 'The specified admin does not exist'
      })
    } else if (admin.role !== 'root') return res
        .status(401)
        .json({ success: false, message: 'Get outta here you fucking hacker!' })

    // Notify to cameras
    global.io.to(camera).emit('activate')
    return res.status(200).json({
      succes: true,
      message: 'Asked for mor photos to camera ' + camera
    })
  })
})

router.route('/cameras/alarm/fine').post((req, res) => {
  const { site } = req.body

  // Update site sensors value
  Site.findOneAndUpdate({ _id: site }, { $set: { fine: true } }).exec(error => {
    if (error) {
      winston.error(error)
      return res.status(400).json({
        success: 'false',
        message: 'The specified site does not exist'
      })
    }
    return res.status(200).json({ success: true, message: 'Alarm is fine' })
  })
})

/** *** CAMERA LOGS ENDPOINTS ****/
router.route('/cameras/log/battery').post((req, res) => {
  const { camera, battery } = req.body

  new Battery({
    camera,
    battery
  }).save((error, log) => {
    // Save the log
    if (error) {
      winston.error(error)
      return res
        .status(500)
        .json({ success: 'false', message: 'Could not save log.' })
    }
    return res.status(200).json({ success: true, log })
  })
})

// PATCH: This method is still used in old AT&T cameras. It's marked as UNSAFE and needs to be DEPRECATED
router.route('/cameras/alarm/photos').post((req, res) => {
  const { camera, photo, pc1, pc2 } = req.body
  const photos = []

  Site.findOne({ key: camera }).exec((error, site) => {
    if (error) {
      winston.error(error)
      return res
        .status(500)
        .json({ success: false, message: 'Could not find site' })
    }
    if (!site) return res
        .status(404)
        .json({ success: false, message: 'The specified site was not found' })

    // Sort alarms by timestamp
    site.alarms.sort(($0, $1) => {
      return $1.timestamp - $0.timestamp
    })

    // Generate images in folder
    // Front photo
    return base64Img.img(
      photo,
      'static/alerts',
      shortid.generate() + Date.now(),
      (error, photo1) => {
        const photo = '/' + photo1
        photos.push(photo)
        // Left photo
        base64Img.img(
          pc1,
          'static/alerts',
          shortid.generate() + Date.now(),
          (error, photo2) => {
            const photo = '/' + photo2
            photos.push(photo)
            // Right photo
            base64Img.img(
              pc2,
              'static/alerts',
              shortid.generate() + Date.now(),
              (error, photo3) => {
                const photo = '/' + photo3
                photos.push(photo)
                // Push photos to latest alarm created
                site.alarms[0].photos = photos

                // Save site with new urls
                site.save((error, updatedSite) => {
                  if (error) {
                    winston.error(error)
                    return res
                      .status(500)
                      .json({ success: false, message: 'Could not find site' })
                  }

                  return res
                    .status(200)
                    .json({ success: true, message: updatedSite })
                })
              }
            )
          }
        )
      }
    )
  })
})

/** *** CAMERA LOGS ENDPOINTS ****/
router.route('/cameras/log/battery').post((req, res) => {
  const { camera, battery } = req.body

  new Battery({
    camera,
    battery
  }).save((error, log) => {
    // Save the log
    if (error) {
      winston.error(error)
      return res
        .status(500)
        .json({ success: 'false', message: 'Could not save log.' })
    }
    return res.status(200).json({ success: true, log })
  })
})

router.route('/cameras/log/report').post((req, res) => {
  const {
    vibration_one,
    vibration_two,
    door_one,
    door_two,
    battery,
    camera_one,
    camera_two
  } = req.body

  new Report({
    vibration_one,
    vibration_two,
    door_one,
    door_two,
    battery,
    camera_one,
    camera_two
  }).save((error, log) => {
    // Save the log
    if (error) {
      winston.error(error)
      return res
        .status(500)
        .json({ success: 'false', message: 'Could not save log.' })
    }
    return res.status(200).json({ success: true, log })
  })
})
router.route('/cameras/log/access').post((req, res) => {
  const { camera, pin, status, photo } = req.body

  new Access({
    camera,
    pin,
    status,
    photo
  }).save((error, log) => {
    // Save the log
    if (error) {
      winston.error(error)
      return res
        .status(500)
        .json({ success: 'false', message: 'Could not save log.' })
    }
    return res.status(200).json({ success: true, log })
  })
})

module.exports = router
