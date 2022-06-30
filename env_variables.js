const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  MONGO_DB_URL: process.env.MONGO_DB,
  PORT: process.env.PORT,
  JWT_STRING: process.env.JWT_SIGN,
};
