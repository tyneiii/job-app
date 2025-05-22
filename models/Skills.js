const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    skill: {type: String, required: true}
}, {timestamps: true});

module.exports = mongoose.model('Skill', skillSchema);