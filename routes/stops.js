const router = require("express").Router();
const Stop = require("../models/Stop");
const verifyToken = require("./verifyToken");

const { stopValidation } = require("../validation/stopValidation");


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

//GET ALL STOPS
router.get("/", verifyToken, async (req, res) => {
  try {
    const listStops = await Stop.find({ id_user: req.user._id }, "-id_user");
    res.json(listStops);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//ADD STOP
router.post("/addStop", verifyToken, async (req, res) => {
  //VALIDATE STOP DATA
  const { error } = stopValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  //VERIFY DATE/TIME END GREATER THAN START
  if (!verifyTimeStamp(getUnixTimeStamp(req.body.from, req.body.dateFrom), getUnixTimeStamp(req.body.to, req.body.dateTo))) { res.status(400).json({ error: "Start date/time must be greater than end date/time" }); return; }
  //CREATE NEW STOP
  const stop = new Stop({
    ...req.body,
    id_user: req.user._id,
  });
  try {
    await stop.save();
    const listStops = await Stop.find({ id_user: req.user._id }, "-id_user");
    res.json(listStops);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//UPDATE STOP
router.post("/updateStop/:id", verifyToken, async (req, res) => {
  //VALIDATE STOP DATA
  delete req.body._id;
  const { error } = stopValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  //VERIFY DATE/TIME END GREATER THAN START
  if (!verifyTimeStamp(getUnixTimeStamp(req.body.from, req.body.dateFrom), getUnixTimeStamp(req.body.to, req.body.dateTo))) { res.status(400).json({ error: "Start date/time must be greater than end date/time" }); return; }
  try {
    await Stop.findOneAndUpdate(
      { _id: req.params.id }, req.body, { omitUndefined: true }
    );
    const listStops = await Stop.find({ id_user: req.user._id }, "-id_user");
    res.json(listStops);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


//DELETE STOP
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Stop.findByIdAndDelete(req.params.id);
    const listStops = await Stop.find({ id_user: req.user._id }, "-id_user");
    res.json(listStops);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//GET STOP
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    res.json(stop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
