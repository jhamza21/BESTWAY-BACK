const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  id_user: { type: mongoose.Types.ObjectId },
  name: { type: String },
  start_address: {
    location_id: { type: String, },
    lat: { type: Number, },
    lon: { type: Number, },
  },
  mobile_number: { type: String },
  email: { type: String },
  max_distance: { type: Number },
  profile: { type: String },
  weight_capacity: { type: Number },
  volume_capacity: { type: Number },
  skills: { type: Array },
  from: { type: String, },
  dateFrom:{type:String},
  to: { type: String, },
  dateTo:{type:String}

}, { versionKey: false });

module.exports = mongoose.model("Driver", driverSchema);