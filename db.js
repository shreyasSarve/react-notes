const mongoose = require("mongoose");
const { MONGO_DB_URL } = require("./env_variables");
const mongoDbUrl = MONGO_DB_URL;
 

const connectToMongo = async () => {
  mongoose.connect(mongoDbUrl, () => console.log("Connected to MongoDB"));
  require("./model/User");
};
module.exports = connectToMongo;
