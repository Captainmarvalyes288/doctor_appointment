import mongoose from 'mongoose';

const labRecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  tests: [{
    type: String,
    required: true,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  labAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabAppointment'
  },
  results: {
    type: String,
    trim: true
  },
  resultFiles: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

const LabRecommendation = mongoose.model('LabRecommendation', labRecommendationSchema);

export default LabRecommendation; 