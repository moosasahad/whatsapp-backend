require("dotenv").config();
const mongoose = require("mongoose");
const router = require("./Routes/Router");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {server,express,app} = require("./socket/socket");



app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FROND_END_URL,
    credentials: true,
  })
);
app.use(router);


mongoose
  .connect(process.env.CONECTTIN_URL, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });



// app.set("io", io);

server.listen(process.env.PORT, () => {
  console.log("Server is running at port", process.env.PORT);
});

// module.exports = io;
