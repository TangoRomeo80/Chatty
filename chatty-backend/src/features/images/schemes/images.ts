// Schemes for image joi validation
// import dependencies
import Joi, { ObjectSchema } from 'joi'

const addImageSchema: ObjectSchema = Joi.object().keys({
  image: Joi.string().required(),
})

export { addImageSchema }
