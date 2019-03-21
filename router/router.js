const express = require('express');
const moment = require('moment');
const Image = require('../models/image.js');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({ // Defines the destination for files and concatenates filename with time

    destination: (req, file, callback) => {
        callback(null, './uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
});

router.get('/', (req, res, err) => {
    res.render("images/addimage.handlebars", {
        viewTemplate: 'Image Upload'
    });
});

router.post('/', upload.single('image'), (req, res) => {
    const image = new Image({
        time: moment(),
        title: req.body.title,
        image: req.file.path,
        category: req.body.category,
        details: req.body.details
    });
    image.save().then((image) => {
        res.render("images/gallery.handlebars", {
            viewTemplate: 'Uploaded Succesfully',
            image: image
        })
    }).catch((err) => {
        console.log('Failed to upload because:', err);
    });
});
router.get('/gallery', (req, res, err) => {
    Image.find()
        .select("time title image category details")
        .exec()
        .then((image) => {
            console.log(image);
            const time = moment(image[0].time).format('MMMM Do YYYY, h:mm:ss a');
            res.render("images/gallery.handlebars", {
                image: image,
                time: time,
            });
        }).catch(err);
});
router.get('/images', (req, res, err) => {
    Image.find()
        .select("time title image category details")
        .exec()
        .then((image) => {
            res.send(image);
        }).catch(err);
});

module.exports = router;