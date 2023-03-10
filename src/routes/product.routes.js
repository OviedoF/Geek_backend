const express = require("express");
const path = require("path");
const router = express.Router();
const productsControllers = require(path.join(__dirname, '..', 'controllers', 'products.controller'));

router.get('/', productsControllers.getProducts);
router.get('/category/:category/:page', productsControllers.getProductsByCategory);
router.get('/:id', productsControllers.getProductById);
router.get('/page/:id', productsControllers.getProductsPerPage)

router.post('/filters', productsControllers.filterAndGetProducts);
router.post('/', productsControllers.createProduct);
router.post('/:id/addImage', productsControllers.pushImage);

router.put('/:id', productsControllers.updateProduct);
router.put('/:id/principalImage', productsControllers.updatePrincipalImage);

router.delete('/:id/:filename', productsControllers.removeImage);
router.delete('/:id', productsControllers.deleteProduct);
module.exports = router;