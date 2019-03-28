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