const express = require("express");
const path = require("path");
const router = express.Router();
const categoriesControllers = require(path.join(__dirname, '..', 'controllers', 'categories.controller'));
const { isAdmin } = require(path.join(__dirname, '..', 'middlewares', 'authRoles'))

router.get('/', categoriesControllers.getCategories);

router.get('/:id', categoriesControllers.getCategoryById);

router.post('/', isAdmin, categoriesControllers.createCategory);

router.put('/:id', isAdmin, categoriesControllers.updateCategory);

router.delete('/delete/:id', isAdmin, categoriesControllers.deleteCategory);

module.exports = router;