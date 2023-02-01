const express = require("express");
const path = require("path");
const router = express.Router();
const shopControllers = require(path.join(__dirname, '..', 'controllers', 'shop.controller'));
const {checkDuplicateShop} = require(path.join(__dirname, '..', 'middlewares', 'verifyMiddleware'));

router.get('/', shopControllers.getShop);
router.get('/:id', shopControllers.getShopById);
router.get('/:id/notifications', shopControllers.getNotifications);

router.post('/', [
    checkDuplicateShop('name', 'Nombre de tienda ya utilizado, utilice otro.'),
    checkDuplicateShop('email', 'Email ya utilizado por otra tienda.'),
    checkDuplicateShop('cellPhone', 'No se puede utilizar el mismo celular en 2 tiendas.')
] , shopControllers.createShop);

router.put('/:id', shopControllers.updateShop);

module.exports = router;