const express = require("express");
const path = require("path");
const router = express.Router();
const postsControllers = require(path.join(__dirname, '..', 'controllers', 'posts.controller'));

router.post('/:id', postsControllers.createPost);

module.exports = router;