const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require('cors');

//IMPORT ROUTES
const usersRoute = require("./routes/users");
const driverRoute = require("./routes/drivers");
const stopRoute = require("./routes/stops");
const routing = require("./routes/routing");
const solution = require("./routes/solution");




//CONNECT TO DB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("Connected to database succesfully")
);

//MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use('/photos',express.static('photos'))
//ROUTES MIDDELWARE
app.use("/api/user", usersRoute);
app.use("/api/driver", driverRoute);
app.use("/api/stop", stopRoute);
app.use("/api/routing", routing);
app.use("/api/solution", solution);


app.listen(process.env.PORT, () => console.log("Server is running on port : " + process.env.PORT));
