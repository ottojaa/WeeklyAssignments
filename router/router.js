const express = require('express');
const moment = require('moment');
const Image = require('../models/image.js');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');

const storage = multer.diskStorage({ // Defines the destination for files

    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
});

router.get('/', (req, res) => {
    res.render("images/addimage.handlebars", {
        viewTemplate: 'Image Upload',
        host: process.env.DB_HOST + ':' + process.env.APP_PORT,
        sendtype: process.env.APP_HTTP,
    });
});

router.post('/', upload.single('image'), (req, res) => {

    createThumbnails(req.file.path, req.file.originalname);
    const image = new Image({
        time: moment(),
        title: req.body.title,
        image: req.file.path,
        category: req.body.category,
        details: req.body.details,
        fileName: req.file.originalname
    });
    image.save().then((image) => {
        res.render("images/gallery.handlebars", {
            viewTemplate: 'Uploaded Succesfully',
            image: image,
            host: process.env.DB_HOST + ':' + process.env.APP_PORT,
            sendtype: process.env.APP_HTTP,
        })
    }).catch((err) => {
        console.log('Failed to upload because:', err);
    });
});

function createThumbnails(path, name) {
    let width = 200;
    let height = 112;
    for (let i = 1; i <= 2; i++){
        let filePath = 'uploads/small/small_';
        if (i === 2){
            filePath = 'uploads/mid/mid_';
        }
        sharp(path)
            .resize(width * i, height * i)
            .toFile(filePath + name, (err, info) => {
                console.log(err, info);
            });
    }
}

router.get('/gallery', (req, res, err) => {
    Image.find()
        .select("time title image category details fileName")
        .exec()
        .then((image) => {
            console.log(image);
            const time = moment(image[0].time).format('MMMM Do YYYY, h:mm:ss a');
            res.render("images/gallery.handlebars", {
                image: image,
                time: time,
                host: process.env.DB_HOST + ':' + process.env.APP_PORT,
                sendtype: process.env.APP_HTTP,
            });
        }).catch(err);
});
router.get('/images', (req, res, err) => {
    Image.find()
        .select("time title image category details fileName")
        .exec()
        .then((image) => {
            res.send(image);
        }).catch(err);
});

module.exports = router;