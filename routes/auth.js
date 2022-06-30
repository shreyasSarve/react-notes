const User = require("../model/User");
const express = require("express");
const bcryptjs = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { JWT_STRING } = require("../env_variables");
const fetchUser = require("../controllers/fetchUser");
// # ROUTE 2
//@i Creating user(Sign Up route)
router.post(
  "/createuser",
  body("email", "Enter Valid Email address").isEmail(), //@i  Validating Email using express validator
  body("password", "Enter Password of Min Lenght 6").isLength({ min: 6 }), //@i Length of password should be 6 min
  async (req, res) => {
    const errors = validationResult(req); //@i error.isEmpth() if the lenght of errors is 0 or not
    if (!errors.isEmpty()) {
      return res.status(400).json(invalidCred(errors));
    }
    try {
      const { email, password, name } = req.body;
      //@i checking if user already exist or not
      let isUserExist = await User.findOne({ email });
      if (isUserExist) {
        return res.status(400).json({
          status: 400,
          message: "user already exist please login with credentials",
          error: [],
        });
      }
      //@i salt is used for extra secirity no need to store salt bcryptjs take care of it
      const salt = await bcryptjs.genSalt(10);
      const encrptPassword = await bcryptjs.hash(password, salt);

      const user = await User.create({
        name,
        email,
        password: encrptPassword,
      });
      const data = {
        user: { id: user.id },
      };
      //@i responce will be authToken instead of whole user body authToken will be more secure way
      //@i signing with our signature so that we can locate the tampering with our authToken
      const authToken = jwt.sign(data, JWT_STRING);
      return res
        .status(200)
        .json({ status: 200, authToken, message: "User Created" });
    } catch (e) {
      //@e incase of Internal error i.e, server errors
      res.status(500).json({ status: 500, error: "Internal Server Error" });
    }
  }
);
//# ROUTE 2
//@i Login route
router.post(
  "/login",
  body("email", "Email Cannot be empty").exists(),
  body("email", "Enter valid email address").isEmail(),
  body("password", "Password cannot be empty").exists(),
  async (req, res) => {
    const errors = validationResult(req); //@i error.isEmpth() if the lenght of errors is 0 or not

    if (!errors.isEmpty()) {
      return res.status(400).json(invalidCred(errors));
    }
    const { email, password } = req.body;
    console.log(email, password);
    try {
      const user = await User.findOne({ email });
      if (!user) {
        //@i incare if user does not exist

        return res.status(400).json(invalidCred());
      }
      const passwordMatching = await bcryptjs.compare(password, user.password);
      if (!passwordMatching) return res.status(400).json(invalidCred());

      const data = {
        user: { id: user.id },
      };
      //@i responce will be authToken instead of whole user body authToken will be more secure way
      //@i signing with our signature so that we can locate the tampering with our authToken
      const authToken = jwt.sign(data, JWT_STRING);
      return res.status(200).json({
        status: 200,
        authToken,
        message: "Login Successful",
        error: [],
      });
    } catch (e) {
      //@e incase of Internal error i.e, server errors
      return res.status(500).json({
        status: 500,
        error: e,
        message:
          "Internal Server Error Occured please try again after some time",
      });
    }
  }
);

//# ROUTE 3
//@i This route is for loading user details from server : Login Required
router.post("/user", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .select("-__v"); //@i -__v is used to remove __v from the response
    return res.status(200).json({
      status: 200,
      user,
      message: "User fetched",
      error: [],
    });
  } catch (e) {
    return res.status(500).json({
      status: 500,
      error: e,
      message: "Internal Server Error Occured please try again after some time",
    });
  }
});

const invalidCred = (error) => {
  return {
    status: 400,
    message: "Invalid credentials please enter valid credentials ",
    error: error ?? [],
  };
};
module.exports = router;
