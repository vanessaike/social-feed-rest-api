const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const {body} = require("express-validator");

//prettier-ignore
const validation = [
  body("firstName").isLength({min: 1}).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({min: 5})
];

router.put("/signup", validation, authController.signup);
router.post("/login", authController.login);

module.exports = router;
