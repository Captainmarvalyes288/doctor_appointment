import MedicalRecord from '../models/medicalRecordModel.js';
import Appointment from '../models/appointmentModel.js';

// Get all medical records for a user
export const getUserMedicalRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const records = await MedicalRecord.find({ user: userId })
      .populate({
        path: 'appointment',
        populate: {
          path: 'doctor',
          select: 'name speciality'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ 
      message: 'Failed to fetch medical records',
      error: error.message 
    });
  }
};

// Get a specific medical record by ID
export const getMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const record = await MedicalRecord.findById(id)
      .populate({
        path: 'appointment',
        populate: {
          path: 'doctor',
          select: 'name speciality'
        }
      });
    
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    // Check if the record belongs to the user
    if (record.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this record' });
    }
    
    res.status(200).json(record);
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({ 
      message: 'Failed to fetch medical record',
      error: error.message 
    });
  }
};

// Get medical record by appointment ID
export const getMedicalRecordByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    
    // Verify the appointment belongs to the user
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this appointment' });
    }
    
    const record = await MedicalRecord.findOne({ appointment: appointmentId })
      .populate({
        path: 'appointment',
        populate: {
          path: 'doctor',
          select: 'name speciality'
        }
      });
    
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found for this appointment' });
    }
    
    res.status(200).json(record);
  } catch (error) {
    console.error('Error fetching medical record by appointment:', error);
    res.status(500).json({ 
      message: 'Failed to fetch medical record',
      error: error.message 
    });
  }
};

// Create a new medical record
export const createMedicalRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId, ...recordData } = req.body;
    
    // Verify the appointment belongs to the user
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to create a record for this appointment' });
    }
    
    // Check if a record already exists for this appointment
    const existingRecord = await MedicalRecord.findOne({ appointment: appointmentId });
    if (existingRecord) {
      return res.status(400).json({ message: 'A medical record already exists for this appointment' });
    }
    
    const newRecord = new MedicalRecord({
      user: userId,
      appointment: appointmentId,
      ...recordData
    });
    
    const savedRecord = await newRecord.save();
    
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(400).json({ 
      message: 'Failed to create medical record',
      error: error.message 
    });
  }
};

// Update a medical record
export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    // Remove appointmentId from update data if present
    if (updateData.appointmentId) {
      delete updateData.appointmentId;
    }
    
    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    // Check if the record belongs to the user
    if (record.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this record' });
    }
    
    Object.assign(record, updateData);
    const updatedRecord = await record.save();
    
    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(400).json({ 
      message: 'Failed to update medical record',
      error: error.message 
    });
  }
};

// Delete a medical record
export const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    
    // Check if the record belongs to the user
    if (record.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }
    
    await record.deleteOne();
    
    res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ 
      message: 'Failed to delete medical record',
      error: error.message 
    });
  }
}; 