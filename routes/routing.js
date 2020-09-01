const router = require("express").Router();
const Stop = require("../models/Stop");
const Driver = require("../models/Driver");
const verifyToken = require("./verifyToken");
const Axios = require("axios");
const Solution = require("../models/solution");

//ADAPT STOP PRIORITY TO API
function getPriority(priority) {
  if (!priority) return undefined
  else return 11 - priority;
}
//CALCULATE UNIX TIMESTAMP FROM DATE/TIME
function getUnixTimeStamp(time, date) {
  let t = time.split(":");
  let d = date.split("-");
  let unixTimeStamp = new Date(d[0], d[1], d[2], t[0], t[1]).getTime();
  return Math.round(unixTimeStamp / 1000);
}
//ADAPT STOP SIZE TO API
function getSize(volume, weight) {
  let size = [];
  size[0] = volume ? volume : 0;
  size[1] = weight ? weight : 0;
  return size;
}
//RETURN DRIVER'S NAME
function getNameDriver(drivers, id) {
  return drivers.find((e) => e._id == id).name;
}
//RETURN DRIVER'S PROFILE
function getDriverProfile(drivers, id) {
  return drivers.find((e) => e._id == id).profile;
}
//RETURN STOP'S NAME
function getNameStop(stops, id) {
  if (!id) return undefined;
  return stops.find((e) => e._id == id).name;
}
//GET STOP BY ID
function getIdStop(stops, id) {
  if (!id) return undefined;
  return stops.find((e) => e._id == id)._id;
}
//GET STOPS FROM API
function getStops(activities, listStops) {
  let stops = [];
  activities.forEach((act) => {
    stops.push({
      type: act.type,
      name: getNameStop(listStops, act.id),
      served_at: act.arr_time,
      end_time: act.end_time,
      distance: act.distance,
      waiting_time: act.waiting_time,
      driving_time: act.driving_time,
      _id: getIdStop(listStops, act.id),
      address: act.address,
    });
  });
  return stops;
}

//RETURN ROUTING SOLUTION
router.get("/", verifyToken, async (req, res) => {
  try {
    //GET LIST STOPS
    const listStops = await Stop.find({ id_user: req.user._id }, "-id_user");
    if (listStops.length === 0) res.status(500).json({ error: 'You have no stops' });
    //GET LIST DRIVERS
    const listDrivers = await Driver.find(
      { id_user: req.user._id },
      "-id_user"
    );
    if (listDrivers.length === 0) res.status(500).json({ error: 'You have no drivers' });
    //ADAPTING DATA TO GRAPHHOPPER
    var vehicles = [];
    var services = [];
    var vehicle_types = [];
    //SERVICES
    listStops.forEach((stop) => {
      services.push({
        id: stop._id,
        address: stop.address,
        name: stop.name,
        priority: getPriority(stop.priority),
        duration: stop.duration ? stop.duration * 60 : undefined,
        time_windows: [{ earliest: getUnixTimeStamp(stop.from, stop.dateFrom), latest: getUnixTimeStamp(stop.to, stop.dateTo) }],
        size: getSize(stop.volume, stop.weight),
        required_skills: stop.required_skills,
      });
    });
    //VEHICLES
    listDrivers.forEach((driver) => {
      vehicles.push({
        vehicle_id: driver._id,
        type_id: driver._id,
        start_address: driver.start_address,
        earliest_start: getUnixTimeStamp(driver.from, driver.dateFrom),
        latest_end: getUnixTimeStamp(driver.to, driver.dateTo),
        skills: driver.skills,
        max_distance: driver.max_distance * 1000,
      });
      //VEHICLES TYPE
      vehicle_types.push({
        type_id: driver._id,
        profile: driver.profile,
        capacity: getSize(driver.volume_capacity, driver.weight_capacity),
      });
    });
    //SENDING DATA TO API
    const response = await Axios.post(
      "https://graphhopper.com/api/1/vrp?key=" + process.env.API_KEY_GRAPHHOPPER,
      {
        vehicles,
        services,
        vehicle_types,
        configuration: {
          routing: {
            calc_points: true,
            snap_preventions: [],
          },
        },
      }
    );
    let routes = [];
    let unassigned = [];
    //EXTRACT INFO FROM API RESULT
    response.data.solution.routes.forEach((route) => {
      const name = getNameDriver(listDrivers, route.vehicle_id);
      const profile = getDriverProfile(listDrivers, route.vehicle_id);
      const stops = getStops(route.activities, listStops);
      const points = route.points;
      const id = route.vehicle_id;
      const distance = route.distance;
      const time = route.transport_time;
      routes.push({ _id: id, distance, time, name, stops, points, profile });
    });
    response.data.solution.unassigned.details.forEach((service) => {
      const name = getNameStop(listStops, service.id);
      const reason = service.reason;
      unassigned.push({ name, reason });
    });

    //SAVING SOLUTION
    const oldSolution = await Solution.findOne({ id_user: req.user._id });
    if (oldSolution) {
      oldSolution.routes = routes;
      oldSolution.unassigned = unassigned;
      const savedSolution = await oldSolution.save();
    } else {
      const newSolution = new Solution({
        id_user: req.user._id,
        routes: routes,
        unassigned: unassigned
      });
      const savedSolution = await newSolution.save();
    }
    //RETURN SOLUTION
    res.json({ routes, unassigned });
  } catch (error) {
    res.status(400).json({ error: error.response.data.message });
  }
});

module.exports = router;
