/* eslint-env node */
const express = require('express')
const router = new express.Router()
const path = require('path')
const { exec } = require('child_process')

const { slackMessage } = require(path.resolve('lib/slack'))

router.post('/webhook-master', (req, res) => {
  slackMessage({
    text: '*Build started. Prepare you motherfucker*'
  })

  exec('git pull; yarn; yarn build:prod', (error, stdout, stderr) => {
    if (error) {
      slackMessage({
        text: `*Build errored*\nOutput: ${error}`
      })

      return
    }

    if (stdout) {
      exec('yarn reload:prod')
      slackMessage({
        text: `*Build succeed!*\nYou're awersome`
      })
    }

    if (stderr) {
      slackMessage({
        text: `*Errors and Warnings:*\n${stderr}`
      })
    }
  })

  res.status(200).json({ message: 'Webhook recieved' })
})

module.exports = router
