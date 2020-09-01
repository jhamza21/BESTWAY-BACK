const Joi = require("@hapi/joi");
Joi.objectId = require('joi-objectid')(Joi)

// STOP VALIDATION
const stopValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: {
      location_id: Joi.string().required(),
      lat: Joi.number().required(),
      lon: Joi.number().required(),
    },
    priority: Joi.number().min(1).max(10),
    duration: Joi.number().min(0).max(10080),
    weight: Joi.number().min(0).max(1000),
    volume: Joi.number().min(0).max(1000),
    note: Joi.string().max(150),
    required_skills: Joi.array(),
    mobile_number: Joi.string().min(6).max(15),
    email: Joi.string().email(),
    from: Joi.string().required(),
    dateFrom: Joi.string().required(),
    to: Joi.string().required(),
    dateTo: Joi.string().required(),
  });
  return schema.validate(data);
};

module.exports.stopValidation = stopValidation;
