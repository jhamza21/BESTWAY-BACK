const Joi = require("@hapi/joi");



//UPDATE USER VALIDATION
const userValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6),
    passwordCheck: Joi.string().min(6),
    image: Joi.optional(),
  });
  return schema.validate(data);
};


module.exports.userValidation = userValidation;

