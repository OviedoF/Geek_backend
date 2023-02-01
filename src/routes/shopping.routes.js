const express = require("express");
const path = require("path");
const router = express.Router();
const shoppingController = require(path.join(__dirname, '..', 'controllers', 'shopping.controller.js'));

router.post('/confirm/local/:id', shoppingController.authorizeLocalShopping);
router.post('/end/local', shoppingController.endLocalShopping);

module.exports = router;