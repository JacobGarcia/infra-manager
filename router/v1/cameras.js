/* eslint-env node */
const express = require('express')
const path = require('path')
const winston = require('winston')
const router = new express.Router()

// const Site = require(path.resolve('models/Site'))
// const Zone = require(path.resolve('models/Zone'))
const mongoose = require('mongoose')
const base64Img = require('base64-img')
const shortid = require('shortid')
const Battery = require(path.resolve('models/Battery'))
const Site = require(path.resolve('models/Site'))
const Report = require(path.resolve('models/Report'))
const Access = require(path.resolve('models/Access'))
const Face = require(path.resolve('models/Face'))
const Admin = require(path.resolve('models/Admin'))



// Return all logs from specific site
router.route('/cameras/logs/:camera')
.get((req, res) => {
  const camera = req.params.camera

  //Find battery logs
  Battery.find({ camera })
  .exec((error, batteryLogs) => {
    if (error) {
      winston.error(error)
      return res.status(500).json({'success': "false",'message': "Could not retrieve battery log."})
    }

    //Find Report logs
    Report.find({ camera })
    .exec((error, reportLogs) => {
      if (error) {
        winston.error(error)
        return res.status(500).json({'success': "false",'message': "Could not retrieve report log."})
      }

      //Find access logs
      Access.find({ camera })
      .exec((error, accessLogs) => {
        if (error) {
          winston.error(error)
          return res.status(500).json({'success': "false",'message': "Could not retrieve battery log."})
        }

        return res.status(200).json({ 'success': true, batteryLogs, reportLogs, accessLogs })
      })
    })
  })
})

// Return last status only for report
// Return last status of access only (to know if the user is valid or not)
router.route('/cameras/report/shit/:site')
.get((req, res) => {
  const camera = req.params.site

  //Find battery logs
  Report.find({ camera })
  .exec((error, reportLogs) => {
      if (error) {
        winston.error(error)
        return res.status(500).json({'success': "false",'message': "Could not retrieve report log."})
      }
      if (!reportLogs) return res.status(404).json({'success': false, 'message': "The camera specified does not exists"})
      else {
        //order logs from most recent access to return the first element. Sync call, so no problem for the return
        reportLogs.sort((a, b) => {
          return parseFloat(b.timestamp) - parseFloat(a.timestamp)
        })
        return res.status(200).json( { 'success': true,'report': reportLogs[0]})
        //return res.status(200).json( { 'success': true } ,reportLogs[0] )
      }
  })
})

// Upgrade all cameras
router.route('/cameras/multi/upgrade')
.post((req, res) => {
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
router.route('/cameras/multi/debug')
.post((req, res) => {
  Admin.findOne({ '_id': req.U_ID })
  .exec((error, admin) => {
    if (error) {
      winston.error(error)
      return res.status(400).json({'success': "false", 'message': "The specified admin does not exist"})
    }
    else if (admin.role != 'root') return res.status(401).json({'success': false, 'message': "Get outta here you fucking hacker!"})
    else {
      // Notify to all cameras
      global.io.emit('debug')
      return res.status(200).json({ 'succes': true, 'message': "Initiated debugging process to all cameras" })
    }
  })
})

// Get a debug report for all cameras
router.route('/cameras/single/debug')
.post((req, res) => {
  const { camera } = req.body
  // Notify to all cameras
  global.io.to(camera).emit('debug')
  return res.status(200).json({ 'succes': true, 'message': "Initiated debugging process to all cameras" })
})

router.route('/cameras/single/upgrade')
.post((req, res) => {
  const { camera, site } = req.body
  Admin.findOne({ '_id': req.U_ID })
  .exec((error, admin) => {
    if (error) {
      winston.error(error)
      return res.status(400).json({'success': "false", 'message': "The specified admin does not exist"})
    }
    else if (admin.role != 'root')
    return res.status(401).json({'success': false, 'message': "Get outta here you fucking hacker!"})
    else {
      // Notify to cameras
      global.io.to(camera).emit('upgrade', site)
      return res.status(200).json({ 'succes': true, 'message': "Initiated upgrading process to camera " + camera })
    }
  })
})

// Deactivate alarm
router.route('/cameras/alarm/deactivate')
.post((req, res) => {
  const { camera } = req.body
  Admin.findOne({ '_id': req.U_ID })
  .exec((error, admin) => {
    if (error) {
      winston.error(error)
      return res.status(400).json({'success': "false", 'message': "The specified admin does not exist"})
    }
    else if (admin.role != 'root') return res.status(401).json({'success': false, 'message': "Get outta here you fucking hacker!"})
    else {
      // Notify to cameras
      global.io.to(camera).emit('deactivate')
      return res.status(200).json({ 'succes': true, 'message': "Deactivated alarm for camera " + camera })
    }
  })
})

// Ask for more alarm photos
router.route('/cameras/alarm/photos/activate')
.post((req, res) => {
  const { camera } = req.body
  Admin.findOne({ '_id': req.U_ID })
  .exec((error, admin) => {
    if (error) {
      winston.error(error)
      return res.status(400).json({'success': "false", 'message': "The specified admin does not exist"})
    }
    else if (admin.role != 'root') return res.status(401).json({'success': false, 'message': "Get outta here you fucking hacker!"})
    else {
      // Notify to cameras
      global.io.to(camera).emit('activate')
      return res.status(200).json({ 'succes': true, 'message': "Asked for mor photos to camera " + camera })
    }
  })
})

router.route('/cameras/alarm/fine')
.post((req, res) => {
  const { site, alert }  = req.body

  // Update site sensors value
  Site.findOneAndUpdate({ _id: site }, { $set: { fine: true } })
  .exec((error, thesite) => {
    if (error) {
      winston.error(error)
      return res.status(400).json({'success': "false", 'message': "The specified site does not exist"})
    }
    return res.status(200).json({ 'success': true, 'message': "Alarm is fine" })

  })

})


/***** CAMERA LOGS ENDPOINTS ****/
router.route('/cameras/log/battery')
.post((req, res) => {
  const { camera, battery }  = req.body

  new Battery({
    camera,
    battery
  })
  .save((error, log) => { // Save the log
    if (error) {
      winston.error(error)
      return res.status(500).json({'success': "false",'message': "Could not save log."})
    }
    else return res.status(200).json({ 'success': true, log })
  })
})

// Delete already registered users
router.route('/cameras/alarm/photos')
.post((req, res) => {

  const data = {camera,
         photo,
         pc1,
         pc2 } = req.body

  // Emit alert socket
  //global.io.to('ATT').emit('photo-alarm', data)

  return res.status(200).json({ 'success': true, 'message': 'Bacan'/*,'data':data*/ })
})

/***** CAMERA LOGS ENDPOINTS ****/
router.route('/cameras/log/battery')
.post((req, res) => {
  const { camera, battery }  = req.body

  new Battery({
    camera,
    battery
  })
  .save((error, log) => { // Save the log
    if (error) {
      winston.error(error)
      return res.status(500).json({'success': "false",'message': "Could not save log."})
    }
    else return res.status(200).json({ 'success': true, log })
  })
})

/***** CAMERA LOGS ENDPOINTS ****/
router.route('/cameras/report/clients')
.get((req, res) => {
  //Get all sites to use as rooms
  Site.find({})
  .sort({ 'key': 1 })
  .exec((error, sites) => { // if there are any errors, return the error
    if (error) {
      winston.error(error)
      return res.status(500).json({'success': "false", 'message': "Error at finding sites"}) // return shit if a server error occurs
    }
    else if (!sites) return res.status(404).json({'success': "false",'message': "Sites not found"})
    else {
      let connected_sites = []
      let counter = 0
      sites.forEach((room) => {
        global.io.in(room.key).clients((error, clients) => {
          counter++
          // Just add the rooms who have at least one client
          if (clients != '') connected_sites.push(room.key)
          if (counter === sites.length) return res.status(200).json({'success': true, connected_sites})
        })
      })
    }
  })
})
router.route('/cameras/log/report')
.post((req, res) => {
  const { vibration_one, vibration_two, door_one, door_two, battery, camera_one, camera_two }  = req.body

  new Report({
    vibration_one,
    vibration_two,
    door_one,
    door_two,
    battery,
    camera_one,
    camera_two
  })
  .save((error, log) => { // Save the log
    if (error) {
      winston.error(error)
      return res.status(500).json({'success': "false",'message': "Could not save log."})
    }
    else return res.status(200).json({ 'success': true, log })
  })
})
router.route('/cameras/log/access')
.post((req, res) => {
  const { camera, pin, status, photo }  = req.body

  new Access({
    camera,
    pin,
    status,
    photo
  })
  .save((error, log) => { // Save the log
    if (error) {
      winston.error(error)
      return res.status(500).json({'success': "false",'message': "Could not save log."})
    }
    else return res.status(200).json({ 'success': true, log })
  })
})

// Everytime a face is detected log it
router.route('/cameras/access/facedetection')
.post((req, res) => {
  const { camera, status, photo }  = req.body

  if (!photo) return res.status(400).json({'success': "false", 'message': "Face photo was not sent"})
  else {
    const filename = base64Img.imgSync(photo, 'static/faces', shortid.generate() + Date.now())
    new Face({
        camera,
        status,
        photo: '/' + filename
    })
    .save((error, face) => { // Save the face
      if (error) {
        winston.error(error)
        return res.status(400).json({'success': "false", 'message': "The specified camera does not exist",/*"error":error*/})
      }

      else return res.status(200).json({'success': true, 'message': "Successfully uploaded photo"})
    })
  }
})

module.exports = router