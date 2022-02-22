const jwt = require("jsonwebtoken");
const {throwError} = require("../helpers/error");
const {errorHandling} = require("../helpers/error");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    throwError("Not authenticated.", 401);
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, `${process.env.JWT_SECRET}`);
  } catch (error) {
    errorHandling(error, 500);
  }

  if (!decodedToken) {
    throwError("Not authenticated.", 401);
  }

  req.userId = decodedToken.userId;
  next();
};
