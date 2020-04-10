const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    title: String,//name
    content: String,//address
    age:Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', NoteSchema);