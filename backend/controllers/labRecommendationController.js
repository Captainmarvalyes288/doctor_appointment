import LabRecommendation from '../models/labRecommendationModel.js';
import Appointment from '../models/appointmentModel.js';

// Get all lab recommendations for a user
export const getUserLabRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const recommendations = await LabRecommendation.find({ user: userId })
      .populate('doctor', 'name speciality')
      .populate('appointment')
      .populate('labAppointment')
      .sort({ createdAt: -1 });
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error fetching lab recommendations:', error);
    res.status(500).json({ 
      message: 'Failed to fetch lab recommendations',
      error: error.message 
    });
  }
};

// Get a specific lab recommendation by ID
export const getLabRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const recommendation = await LabRecommendation.findById(id)
      .populate('doctor', 'name speciality')
      .populate('appointment')
      .populate('labAppointment');
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Lab recommendation not found' });
    }
    
    // Check if the recommendation belongs to the user
    if (recommendation.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this lab recommendation' });
    }
    
    res.status(200).json(recommendation);
  } catch (error) {
    console.error('Error fetching lab recommendation:', error);
    res.status(500).json({ 
      message: 'Failed to fetch lab recommendation',
      error: error.message 
    });
  }
};

// Get lab recommendations by appointment ID
export const getLabRecommendationByAppointment = async (req, res) => {
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
    
    const recommendation = await LabRecommendation.findOne({ appointment: appointmentId })
      .populate('doctor', 'name speciality')
      .populate('appointment')
      .populate('labAppointment');
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Lab recommendation not found for this appointment' });
    }
    
    res.status(200).json(recommendation);
  } catch (error) {
    console.error('Error fetching lab recommendation by appointment:', error);
    res.status(500).json({ 
      message: 'Failed to fetch lab recommendation',
      error: error.message 
    });
  }
};

// Create a new lab recommendation (doctor only)
export const createLabRecommendation = async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const { userId, appointmentId, tests, notes } = req.body;
    
    if (!userId || !tests || !tests.length) {
      return res.status(400).json({ message: 'User ID and at least one test are required' });
    }
    
    // Verify the appointment if provided
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      if (appointment.doctor.toString() !== doctorId) {
        return res.status(403).json({ message: 'Not authorized to create a lab recommendation for this appointment' });
      }
    }
    
    const newRecommendation = new LabRecommendation({
      user: userId,
      doctor: doctorId,
      appointment: appointmentId,
      tests,
      notes,
      status: 'pending'
    });
    
    const savedRecommendation = await newRecommendation.save();
    
    res.status(201).json(savedRecommendation);
  } catch (error) {
    console.error('Error creating lab recommendation:', error);
    res.status(400).json({ 
      message: 'Failed to create lab recommendation',
      error: error.message 
    });
  }
};

// Update a lab recommendation (doctor only)
export const updateLabRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor.id;
    const updateData = req.body;
    
    const recommendation = await LabRecommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({ message: 'Lab recommendation not found' });
    }
    
    // Check if the recommendation was created by this doctor
    if (recommendation.doctor.toString() !== doctorId) {
      return res.status(403).json({ message: 'Not authorized to update this lab recommendation' });
    }
    
    // Don't allow changing the user or doctor
    delete updateData.user;
    delete updateData.doctor;
    
    Object.assign(recommendation, updateData);
    const updatedRecommendation = await recommendation.save();
    
    res.status(200).json(updatedRecommendation);
  } catch (error) {
    console.error('Error updating lab recommendation:', error);
    res.status(400).json({ 
      message: 'Failed to update lab recommendation',
      error: error.message 
    });
  }
};

// Update lab recommendation status (user can update to scheduled or cancelled)
export const updateLabRecommendationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, labAppointmentId } = req.body;
    
    if (!status || !['scheduled', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (scheduled or cancelled) is required' });
    }
    
    const recommendation = await LabRecommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({ message: 'Lab recommendation not found' });
    }
    
    // Check if the recommendation belongs to the user
    if (recommendation.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this lab recommendation' });
    }
    
    // Update status and lab appointment if provided
    recommendation.status = status;
    if (status === 'scheduled' && labAppointmentId) {
      recommendation.labAppointment = labAppointmentId;
    }
    
    const updatedRecommendation = await recommendation.save();
    
    res.status(200).json(updatedRecommendation);
  } catch (error) {
    console.error('Error updating lab recommendation status:', error);
    res.status(400).json({ 
      message: 'Failed to update lab recommendation status',
      error: error.message 
    });
  }
};

// Delete a lab recommendation (doctor only)
export const deleteLabRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor.id;
    
    const recommendation = await LabRecommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({ message: 'Lab recommendation not found' });
    }
    
    // Check if the recommendation was created by this doctor
    if (recommendation.doctor.toString() !== doctorId) {
      return res.status(403).json({ message: 'Not authorized to delete this lab recommendation' });
    }
    
    await recommendation.deleteOne();
    
    res.status(200).json({ message: 'Lab recommendation deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab recommendation:', error);
    res.status(500).json({ 
      message: 'Failed to delete lab recommendation',
      error: error.message 
    });
  }
}; 