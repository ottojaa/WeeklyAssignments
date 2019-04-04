const authService = require('../helpers/authService');
const check = require('../helpers/tokenCheck');

exports.authenticate = (req, res, next) => {
    authService.authenticate(req.body)
        .then((user) => {
            console.log(user);
            res.redirect('/images/gallery', {
                user: user,
                token: user.token
            }) 
        })
        .catch(err => next(err));
}

exports.register = (req, res, next) => {
    authService.create(req.body)
        .then((user) => res.json({user}))
        .catch(err => next(err));
}

exports.getAll = (req, res, next) => {
    authService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

exports.getCurrent = (req, res, next) => {
    authService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

exports.getById = (req, res, next) => {
    authService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

exports.update = (req, res, next) => {
    authService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

exports._delete = (req, res, next) => {
    authService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}