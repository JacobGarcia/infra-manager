/* eslint-env node */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

class CompanyClass {
  // Methods
}

const schema = new Schema({
  logo: String, // Url
  name: { type: String, required: true, unique: true },
  services: [String]
})

schema.loadClass(CompanyClass)

module.exports = mongoose.model('Company', schema)
