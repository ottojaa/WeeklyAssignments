const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    time: Number,
    title:  {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true
    },
    fileName: {
        type: String
    }
});

module.exports =  mongoose.model('Image', imageSchema);