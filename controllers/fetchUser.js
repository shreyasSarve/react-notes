const jwt = require("jsonwebtoken");
const { JWT_STRING } = require("../env_variables");

// @i middleware to check if user is logged in or not and validate the token
const fetchUser = (req, res, next) => {
  const authToken = req.get("auth-token");
  if (!authToken) {
    //@e if authToken is not present in header
    return res.status(401).json({
      status: 401,
      error: "Auth Token is required",
      message: "Auth Token is required",
    });
  }
  try {
    const decoded = jwt.verify(authToken, JWT_STRING);
    req.user = decoded.user;
    //@i if authToken is present in header then go to next middleware i.e, real route
    next();
  } catch (e) {
    //@e incase of invalid token
    return res.status(401).json({
      status: 401,
      error: "Invalid Auth Token",
      message: "Invalid Auth Token",
    });
  }
};

module.exports = fetchUser;
