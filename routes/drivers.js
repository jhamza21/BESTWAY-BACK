const router = require("express").Router();
const Driver = require("../models/Driver");
const verifyToken = require("./verifyToken");

const { driverValidation } = require("../validation/driverValidation");

//VERIFY DATE/TIME START DRIVER GREATER THAN DATE/TIME END
function verifyTimeStamp(start, end) {
  if (start >= end) return false;
  return true;
}
//CALCULATE UNIX TIMESTAMP FROM DATE/TIME
function getUnixTimeStamp(time, date) {
  let t = time.split(":");
  let d = date.split("-");
  let unixTimeStamp = new Date(d[0], d[1], d[2], t[0], t[1]).getTime();
  return Math.round(unixTimeStamp / 1000);
}

//GET ALL DRIVERS
router.get("/", verifyToken, async (req, res) => {
  try {
    const listDrivers = await Driver.find(
      { id_user: req.user._id },
      "-id_user"
    );
    res.json(listDrivers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//DELETE DRIVER
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    const listDrivers = await Driver.find(
      { id_user: req.user._id },
      "-id_user"
    );
    res.json(listDrivers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//ADD DRIVER
router.post("/addDriver", verifyToken, async (req, res) => {
  //VALIDATE DRIVER DATA
  const { error } = driverValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  //VERIFY DATE/TIME END GREATER THAN START
  if (!verifyTimeStamp(getUnixTimeStamp(req.body.from, req.body.dateFrom), getUnixTimeStamp(req.body.to, req.body.dateTo))) { res.status(400).json({ error: "Start date/time must be greater than end date/time" }); return; }
  //CREATE NEW DRIVER
  try {
    const driver = new Driver({
      ...req.body,
      id_user: req.user._id,
    });
    await driver.save();
    const listDrivers = await Driver.find(
      { id_user: req.user._id },
      "-id_user"
    );
    res.json(listDrivers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//UPDATE DRIVER
router.post("/updateDriver/:id", verifyToken, async (req, res) => {
  //VALIDATE DRIVER DATA
  delete req.body._id;
  const { error } = driverValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  //VERIFY DATE/TIME END GREATER THAN START
  if (!verifyTimeStamp(getUnixTimeStamp(req.body.from, req.body.dateFrom), getUnixTimeStamp(req.body.to, req.body.dateTo))) { res.status(400).json({ error: "Start date/time must be greater than end date/time" }); return; }
  try {
    await Driver.findOneAndUpdate(
      { _id: req.params.id },
      req.body, { omitUndefined: true }
    );
    const listDrivers = await Driver.find(
      { id_user: req.user._id },
      "-id_user"
    );
    res.json(listDrivers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//GET DRIVER
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
