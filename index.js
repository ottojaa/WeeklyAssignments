require('dotenv').config();
require('handlebars');
const router = require('./router/router.js');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
let Handlebars = require("handlebars");
let MomentHandler = require("handlebars.moment");
MomentHandler.registerHelpers(Handlebars);
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');

const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/small'));
app.use(methodOverride('_method'));
app.use(express.static('uploads'));
app.use((req, res, next) => {
   if (req.query._method === 'DELETE') {
       req.method = 'DELETE';
       req.url = req.path;
   }
   next();
});
app.set('views', path.join(__dirname, '/views/'));
app.engine('handlebars', exphbs({
    extname: 'handlebars',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/'
}));
app.set('view engine', 'handlebars');

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/subscribe?authSource=admin`)
    .then(() => {
        console.log('Connection established to db');
    })
    .then(() => appListen())
    .catch((e) => {
        console.log('Connection to db failed because:', e);
    });

app.use('/images', router);

function appListen() {
    app.listen(3000);
}





