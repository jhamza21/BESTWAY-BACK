const mongoose = require("mongoose");

const solutionSchema = new mongoose.Schema({
  id_user:{ type: mongoose.Types.ObjectId },
  routes: { type: Array },
  unassigned: { type: Array },
}, { versionKey: false });

module.exports = mongoose.model("Solution", solutionSchema);