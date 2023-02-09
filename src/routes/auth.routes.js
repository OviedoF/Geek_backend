const express = require("express");
const path = require("path");
const router = express.Router();
const authController = require(path.join(
  __dirname,
  "..",
  "controllers",
  "auth.controller"
));
const { validatePassword, checkDuplicate } = require(path.join(
  __dirname,
  "..",
  "middlewares",
  "verifySignUp"
));
const configMulter = require(path.join(__dirname, '..', 'config', 'multer.config'));

router.post(
  "/register",
  [
    checkDuplicate(
      "email",
      "Email ya existente, por favor entre en su cuenta."
    ),
    checkDuplicate(
      "username",
      "Nombre de usuario ya registrado, regístrese con uno diferente."
    )
  ],
  authController.signUp
); // checkDuplicate recibe el campo a verificar si está duplicado y un mensaje en caso de que lo esté.

router.post('/login', authController.signIn);

router.post('/login/identifyUser', authController.identifyUserJSW);

module.exports = router;
