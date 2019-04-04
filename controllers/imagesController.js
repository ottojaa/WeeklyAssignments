const Image = require('../models/image.js');

exports.image_search_by_category = (searchTerm, searchCategory) => {
    return Image.find({$text: {$search: searchTerm}})
        .where('category')
        .equals(searchCategory)
        .then((image) => {
            return image;
        }).catch((err) => {
            console.log(err);
            return err;
        });
};

exports.image_search_all = (searchTerm) => {
    return Image.find({$text: {$search: searchTerm}}, {score: {$meta: "textScore"}})
        .sort({score: {$meta: "textScore"}})
        .then((image) => {
            return image;
        }).catch((err) => {
            return err;
        });
};

exports.find_all_posts = () => {
    return Image.find()
        .select("time title image category details fileName")
        .exec()
        .then((image) => {
            return image;
        }).catch((err) => {
            console.log(err);
            return err;
        });
};

exports.find_by_id = (id) => {
  return Image.findById(id)
      .then((image) => {
          return image;
      }).catch((err) => {
          return err;
      })
};

exports.get_all_images = () => {
    return Image.find()
        .select("time title image category details fileName")
        .exec()
        .then((image) => {
            return image;
        }).catch((err) => {
        console.log(err);
    });
};

exports.uploadSingle = (req, res) => {
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
}