import mongoose from 'mongoose'

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export default mongoose.model('Medicine', medicineSchema) 