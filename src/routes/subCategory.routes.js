const express = require("express");
const path = require("path");
const router = express.Router();
const subCategoriesControllers = require(path.join(__dirname, '..', 'controllers', 'subcategories.controller'));
const { isAdmin } = require(path.join(__dirname, '..', 'middlewares', 'authRoles'))

router.get('/', subCategoriesControllers.getSubcategories);
router.get('/:id', subCategoriesControllers.getSubcategoryById);
router.get('/category/:category', subCategoriesControllers.getSubcategoryByFather);

router.post('/', isAdmin, subCategoriesControllers.createSubCategory);
router.put('/:id', isAdmin, subCategoriesControllers.updateSubCategory);

router.delete('/:id', isAdmin, subCategoriesControllers.deleteSubCategory);

module.exports = router;