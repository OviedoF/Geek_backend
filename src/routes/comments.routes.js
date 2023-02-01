const express = require("express");
const path = require("path");
const router = express.Router();
const commentsController = require(path.join(__dirname, '..', 'controllers', 'comments.controller'));

router.get('/:id', commentsController.getComments);
router.post('/create/product', commentsController.createProductComment);
router.post('/create/perfil', commentsController.createPerfilComment);

module.exports = router;