const connectToMongo = require("./db");
const express = require("express");
const { PORT } = require("./env_variables");

const app = express();
app.use(express.json());
app.listen(PORT, () => {
  connectToMongo();
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));
app.get("/", (req, res) => res.send("Hello World....."));
