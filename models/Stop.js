const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  id_user: { type: mongoose.Types.ObjectId },
  name: { type: String, },
  address: {
    location_id: { type: String, },
    lat: { type: Number, },
    lon: { type: Number, },
  },
  priority: { type: Number, },
  duration: { type: Number, },
  weight: { type: Number },
  volume: { type: Number },
  note: { type: String, },
  required_skills: { type: Array },
  email: { type: String, },
  mobile_number: { type: String, },
  from: { type: String, },
  dateFrom:{type:String},
  to: { type: String, },
  dateTo:{type:String}

}, { versionKey: false });

module.exports = mongoose.model("Stop", stopSchema);
