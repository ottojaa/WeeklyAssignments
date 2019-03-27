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

/////////////////// ROUTES /////////////////////////

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
    image.save().then(() => {
        findAllPosts(req, res);
    }).catch((err) => {
        console.log('Failed to upload because:', err);
    });
});

router.get('/gallery', (req, res, err) => {
    findAllPosts(req, res, err);
});
router.get('/images', (req, res) => {
    Image.find()
        .select("time title image category details fileName")
        .exec()
        .then((image) => {
            res.send(image);
        }).catch(err);
});

/////////////////////// Update, Delete and Get-routes for single images//////////////////////////

router.post('/gallery/:id', upload.single('image'), (req, res) => {
    const updatedPost = {
      title: req.body.title,
      details : req.body.details,
      category : req.body.category
    };
    console.log(updatedPost);
    Image.findByIdAndUpdate({_id: req.params.id}, {$set: updatedPost}).then(() => {
        findAllPosts(req, res);
    });
});

router.delete('/gallery/:id', (req, res) => {
    console.log(req.params.id);
    Image.findOneAndDelete({_id: req.params.id}).then(() => {
        findAllPosts(req, res);
    });
});

router.get('/gallery/:id', (req, res) => {
    Image.findById({_id: req.params.id})
        .then((image) => {
            res.render("images/editPost.handlebars", {
                viewTemplate: 'Edit post details',
                image: image
            })
        });
});
router.post('/search', upload.single('image'), (req, res) => {
    console.log(req.body);
    res.send(req.body);
});
//////////////////// FUNCTIONS //////////////////////

function createThumbnails(path, name) {
    let width = 200;
    let height = 112;
    for (let i = 1; i <= 2; i++) {
        let filePath = 'uploads/small/small_';
        if (i === 2) {
            filePath = 'uploads/mid/mid_';
        }
        sharp(path)
            .resize(width * i, height * i)
            .toFile(filePath + name, (err, info) => {
                console.log(err, info);
            });
    }
}

function findAllPosts(req, res) {
    Image.find()
        .select("time title image category details fileName")
        .exec()
        .then((image) => {
            console.log(image.id);
            const time = moment(image[0].time).format('MMMM Do YYYY, h:mm:ss a');
            res.render("images/gallery.handlebars", {
                image: image,
                time: time,
                host: process.env.DB_HOST + ':' + process.env.APP_PORT,
                sendtype: process.env.APP_HTTP,
            });
        }).catch((err) => {
        console.log(err);
    });
}

module.exports = router;