require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const moment = require('moment');
const Image = require('./models/image.js');
const multer = require('multer');

const storage = multer.diskStorage({ // Defines the destination for files and concatenates filename with time

   destination: (req, file, callback) => {
       callback(null, './uploads/');
   },
   filename: (req, file, callback) => {
       callback(null, moment() + file.originalname);
   }
});

const upload = multer({
    storage: storage,
});

const app = express();

app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/subscribe?authSource=admin`)
    .then(() => {
        console.log('Connection established to db');
    })
    .then(() => appListen())
    .catch((e) => {
        console.log('Connection to db failed because:', e);
    });

app.post('/images', upload.single('image'), (req, res) => {
    const image = new Image({
        time: moment(),
        title: req.body.title,
        image: req.file.path,
        category: req.body.category,
        details: req.body.details
    });
    image.save().then((image) => {
        res.send(image);
    });
});
app.get('/images', (req, res, err) => {
    Image.find()
        .select("time title image category details")
        .exec()
        .then((image) => {
       res.send(image);
    }).catch(err);
});

function appListen() {
    app.listen(3000);
}

