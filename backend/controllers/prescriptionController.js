import Prescription from '../models/prescriptionModel.js';
import Appointment from '../models/appointmentModel.js';

// Get all prescriptions for a user
export const getUserPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const prescriptions = await Prescription.find({ user: userId })
      .populate('doctor', 'name speciality')
      .populate('appointment')
      .sort({ createdAt: -1 });
    
    res.status(200).json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ 
      message: 'Failed to fetch prescriptions',
      error: error.message 
    });
  }
};

// Get a specific prescription by ID
export const getPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const prescription = await Prescription.findById(id)
      .populate('doctor', 'name speciality')
      .populate('appointment');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Check if the prescription belongs to the user
    if (prescription.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this prescription' });
    }
    
    res.status(200).json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ 
      message: 'Failed to fetch prescription',
      error: error.message 
    });
  }
};

// Get prescriptions by appointment ID
export const getPrescriptionByAppointment = async (req, res) => {
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
    
    const prescription = await Prescription.findOne({ appointment: appointmentId })
      .populate('doctor', 'name speciality')
      .populate('appointment');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found for this appointment' });
    }
    
    res.status(200).json(prescription);
  } catch (error) {
    console.error('Error fetching prescription by appointment:', error);
    res.status(500).json({ 
      message: 'Failed to fetch prescription',
      error: error.message 
    });
  }
};

// Create a new prescription (doctor only)
export const createPrescription = async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { userId, appointmentId, medications, diagnosis, notes, validUntil } = req.body;
    
    if (!userId || !medications || !medications.length) {
      return res.status(400).json({ message: 'User ID and at least one medication are required' });
    }
    
    // Verify the appointment if provided
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      if (appointment.doctor.toString() !== doctorId) {
        return res.status(403).json({ message: 'Not authorized to create a prescription for this appointment' });
      }
    }
    
    const newPrescription = new Prescription({
      user: userId,
      doctor: doctorId,
      appointment: appointmentId,
      medications,
      diagnosis,
      notes,
      validUntil
    });
    
    const savedPrescription = await newPrescription.save();
    
    res.status(201).json(savedPrescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(400).json({ 
      message: 'Failed to create prescription',
      error: error.message 
    });
  }
};

// Update a prescription (doctor only)
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor.id;
    const updateData = req.body;
    
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Check if the prescription was created by this doctor
    if (prescription.doctor.toString() !== doctorId) {
      return res.status(403).json({ message: 'Not authorized to update this prescription' });
    }
    
    // Don't allow changing the user or doctor
    delete updateData.user;
    delete updateData.doctor;
    
    Object.assign(prescription, updateData);
    const updatedPrescription = await prescription.save();
    
    res.status(200).json(updatedPrescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(400).json({ 
      message: 'Failed to update prescription',
      error: error.message 
    });
  }
};

// Delete a prescription (doctor only)
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor.id;
    
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Check if the prescription was created by this doctor
    if (prescription.doctor.toString() !== doctorId) {
      return res.status(403).json({ message: 'Not authorized to delete this prescription' });
    }
    
    await prescription.deleteOne();
    
    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ 
      message: 'Failed to delete prescription',
      error: error.message 
    });
  }
}; 
 