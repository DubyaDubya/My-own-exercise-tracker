const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const exerciseSchema = new Schema({
    userId: {type: String, required: true},
    description: {type: String, required: true},
    duration: {type: String, required: true},
    date: {type: Date, default: Date.now}
});
var Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;