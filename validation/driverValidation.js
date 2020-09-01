const Joi = require("@hapi/joi");
Joi.objectId = require('joi-objectid')(Joi)



// DRIVER VALIDATION
const driverValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    mobile_number: Joi.string().min(6).max(15),
    start_address: {
      location_id: Joi.string(),
      lat: Joi.number(),
      lon: Joi.number(),
    },
    max_distance: Joi.number().min(0).max(5000),
    profile: Joi.string(),
    skills: Joi.array(),
    weight_capacity: Joi.number().min(0).max(1000),
    volume_capacity: Joi.number().min(0).max(1000),
    email: Joi.string().email(),
    from: Joi.string().required(),
    dateFrom: Joi.string().required(),
    to: Joi.string().required(),
    dateTo: Joi.string().required(),
  });
  return schema.validate(data);
};
module.exports.driverValidation = driverValidation;
