let mongoose = require('mongoose')
let Schema = mongoose.Schema

SortSchema = new Schema({
    name: String,
    price: Number,
    rawPrice: Number
})


module.exports = mongoose.model('Sorting', SortSchema)