const express = require('express');
const moment = require('moment');
const Image = require('../models/image.js');
const ImageController = require('../controllers/imagesController.js');
const UserController = require('../controllers/userController');
require('../helpers/authService');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const check = require('../helpers/tokenCheck');

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

//------------ Routes ------------//
router.get('/', (req, res) => {
    res.render("images/authenticate.handlebars", {
        viewTemplate: 'Login',
        host: process.env.DB_HOST + ':' + process.env.APP_PORT,
        sendtype: process.env.APP_HTTP,
    });
});
router.get('/upload', (req, res) => {
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
        ImageController.find_all_posts()
            .then((image) => {
                const time = moment(image[0].time).format('MMMM Do YYYY, h:mm:ss a');
                res.render("images/gallery.handlebars", {
                    image: image,
                    time: time,
                    host: process.env.DB_HOST + ':' + process.env.APP_PORT,
                    sendtype: process.env.APP_HTTP,
                });
            }).catch((err) => {
                console.log('Failed to upload because:', err);
            })
    });
});

router.get('/gallery', check.tokenCheck, (req, res) => {
    ImageController.find_all_posts()
        .then(() => {
            UserController.getCurrent()
                .then((user) => {
                    return user;
                }).then((image) => {
                    res.render("images/gallery.handlebars", {
                        image: image
                    });
                })
        }).catch((err) => {
            console.log(err);
        });
});

router.get('/images', (req, res) => {
    ImageController.find_all_posts()
        .then((image) => {
            res.send(image);
        });
});

router.post('/gallery/:id', upload.single('image'), (req, res) => {
    const updatedPost = {
        title: req.body.title,
        details: req.body.details,
        category: req.body.category
    };
    console.log(updatedPost);
    Image.findByIdAndUpdate({ _id: req.params.id }, { $set: updatedPost }).then(() => {
        ImageController.find_all_posts()
            .then((image) => {
                const time = moment(image[0].time).format('MMMM Do YYYY, h:mm:ss a');
                res.render("images/gallery.handlebars", {
                    image: image,
                    time: time,
                    host: process.env.DB_HOST + ':' + process.env.APP_PORT,
                    sendtype: process.env.APP_HTTP,
                });
            })
    });
});

router.delete('/gallery/:id', (req, res) => {
    console.log(req.params.id);
    Image.findOneAndDelete({ _id: req.params.id }).then(() => {
        ImageController.find_all_posts()
            .then((image) => {
                const time = moment(image[0].time).format('MMMM Do YYYY, h:mm:ss a');
                res.render("images/gallery.handlebars", {
                    image: image,
                    time: time,
                    host: process.env.DB_HOST + ':' + process.env.APP_PORT,
                    sendtype: process.env.APP_HTTP,
                });
            }).catch((err) => {
                console.log(err);
            })
    });
});

router.get('/gallery/:id', (req, res) => {
    ImageController.find_by_id({ _id: req.params.id })
        .then((image) => {
            res.render("images/editPost.handlebars", {
                viewTemplate: 'Edit post details',
                image: image
            })
        });
});


router.post('/search', upload.single('image'), (req, res) => {
    if (req.body.searchterm !== '' && req.body.searchBy === 'all') {
        ImageController.image_search_all(req.body.searchterm)
            .then((image) => {
                let count = 0;
                image.forEach(() => {
                    count++;
                });
                res.render("images/gallery.handlebars", {
                    viewTemplate: 'Search results found:',
                    image: image,
                    count: count
                });
            }).catch((err) => {
                console.log(err);
            });
    } else if (req.body.searchterm === '') {
        ImageController.image_search_all(req.body.searchterm)
            .then((image) => {
                res.render("images/gallery.handlebars", {
                    viewTemplate: 'Enter a search term!',
                    image: image
                })
            }).catch((err) => {
                console.log(err);
            });
    } else if (req.body.searchterm !== '' && req.body.searchby !== 'all') {
        ImageController.image_search_by_category(req.body.searchterm, req.body.searchby)
            .then((image) => {
                let count = 0;
                image.forEach(() => {
                    count++;
                });
                res.render("images/gallery.handlebars", {
                    viewTemplate: 'Search results found:',
                    image: image,
                    count: count
                })
            }).catch((err) => {
                console.log(err);
            });
    }
});

//------------- Register - Login - User -------------//
router.get('/register', upload.single('image'), (req, res) => {
    res.render("images/register.handlebars", {
        viewTemplate: 'Register',
        host: process.env.DB_HOST + ':' + process.env.APP_PORT,
        sendtype: process.env.APP_HTTP,
    });
});
router.post('/authenticate', UserController.authenticate);
router.post('/register', UserController.register);
router.get('/users', UserController.getAll);
router.get('/current', UserController.getCurrent);
router.get('/:id', UserController.getById);
router.put('/:id', UserController.update);
router.delete('/:id', UserController._delete);

//------------------ Functions --------------------//

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


module.exports = router;