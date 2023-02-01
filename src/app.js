const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const createInitialRoles = require(path.join(__dirname, 'libs', 'initialRoles'));
const createInitialAdmin = require(path.join(__dirname, 'libs', 'initialAdmin'));
const fs = require('fs');
const multerConfig = require(path.join(__dirname, 'config', 'multer.config'));

// initialize
require(path.join(__dirname, 'database.js'));
const app = express();
app.use(cors({
    origin: '*'
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multerConfig);

// configs
createInitialRoles();
createInitialAdmin();

// routes
const routeFiles = fs.readdirSync(path.join(__dirname, 'routes')).filter( (file) => file.endsWith(".js") );

routeFiles.forEach( (file) => {
    app.use(`/api/${file.split('.')[0]}`, require(path.join(__dirname, 'routes', file)));
    console.log(`Route: /api/${file.split('.')[0]} loaded!` );
});

console.log(routeFiles);

module.exports = app; 