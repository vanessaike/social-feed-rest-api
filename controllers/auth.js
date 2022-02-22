const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {throwError} = require("../helpers/error");
const {errorHandling} = require("../helpers/error");
const {validationResult} = require("express-validator");

exports.signup = async function (req, res, next) {
  const firstName = req.body.firstName;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throwError("Invalid input field. Check if your email is valid or if the password is at least 5 characters long.", 422);
    }

    const existingUser = await User.findOne({email: email});
    if (existingUser) {
      throwError("Email already being used. Please, pick another one.", 401);
    }

    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      firstName: firstName,
      email: email,
      password: hashedPw,
    });
    await user.save();
    res.status(201).json({message: "User created successfully."});
  } catch (error) {
    errorHandling(error, next);
  }
};

exports.login = async function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({email: email});
    if (!user) {
      throwError("No user found.", 404);
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throwError("Password is incorrect.", 422);
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      `${process.env.JWT_SECRET}`,
      {expiresIn: "1h"}
    );

    res.status(200).json({token: token, message: "User succesfully logged in."});
  } catch (error) {
    errorHandling(error, next);
  }
};
