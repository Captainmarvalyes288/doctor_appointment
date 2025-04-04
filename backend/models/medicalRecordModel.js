import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  height: {
    type: String,
    trim: true
  },
  weight: {
    type: String,
    trim: true
  },
  bloodPressure: {
    type: String,
    trim: true
  },
  temperature: {
    type: String,
    trim: true
  },
  allergies: {
    type: String,
    trim: true
  },
  currentMedications: {
    type: String,
    trim: true
  },
  pastMedicalHistory: {
    type: String,
    trim: true
  },
  familyMedicalHistory: {
    type: String,
    trim: true
  },
  chiefComplaint: {
    type: String,
    trim: true
  },
  symptoms: {
    type: String,
    trim: true
  },
  symptomDuration: {
    type: String,
    trim: true
  },
  additionalNotes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord; 