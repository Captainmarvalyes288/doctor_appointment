import Lab from '../models/labModel.js'
import LabAppointment from '../models/labAppointmentModel.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'

// Get all labs
export const getAllLabs = async (req, res) => {
  try {
    const labs = await Lab.find()
    if (!labs || labs.length === 0) {
      return res.status(404).json({ message: 'No labs found' })
    }
    res.status(200).json(labs)
  } catch (error) {
    console.error('Error fetching labs:', error)
    res.status(500).json({ 
      message: 'Failed to fetch labs',
      error: error.message 
    })
  }
}

// Get a single lab
export const getLab = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ message: 'Lab ID is required' })
    }

    const lab = await Lab.findById(id)
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' })
    }
    res.status(200).json(lab)
  } catch (error) {
    console.error('Error fetching lab:', error)
    res.status(500).json({ 
      message: 'Failed to fetch lab',
      error: error.message 
    })
  }
}

// Create a new lab
export const createLab = async (req, res) => {
  try {
    const { image, ...labData } = req.body

    // Validate required fields
    const requiredFields = [
      'name', 'address', 'city', 'state', 'zipCode', 
      'phone', 'email', 'services', 'operatingHours', 
      'accreditation', 'description', 'price'
    ]
    const missingFields = requiredFields.filter(field => !labData[field])
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        fields: missingFields 
      })
    }

    // Validate price
    if (isNaN(labData.price) || labData.price <= 0) {
      return res.status(400).json({ message: 'Please enter a valid price' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(labData.email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    // Upload image to Cloudinary if provided
    let imageUrl = image
    if (image && image.startsWith('data:image')) {
      const uploadResult = await uploadToCloudinary(image)
      imageUrl = uploadResult.secure_url
    } else if (!image) {
      return res.status(400).json({ message: 'Lab image is required' })
    }

    const lab = new Lab({
      ...labData,
      image: imageUrl
    })
    const newLab = await lab.save()
    res.status(201).json(newLab)
  } catch (error) {
    console.error('Error creating lab:', error)
    res.status(400).json({ 
      message: 'Failed to create lab',
      error: error.message 
    })
  }
}

// Update a lab
export const updateLab = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ message: 'Lab ID is required' })
    }

    const lab = await Lab.findById(id)
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' })
    }

    const { image, ...updateData } = req.body

    // Validate price if provided
    if (updateData.price && (isNaN(updateData.price) || updateData.price <= 0)) {
      return res.status(400).json({ message: 'Please enter a valid price' })
    }

    // Validate email format if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' })
      }
    }

    // Upload new image to Cloudinary if provided
    if (image && image.startsWith('data:image')) {
      const uploadResult = await uploadToCloudinary(image)
      updateData.image = uploadResult.secure_url
    }

    Object.assign(lab, updateData)
    const updatedLab = await lab.save()
    res.status(200).json(updatedLab)
  } catch (error) {
    console.error('Error updating lab:', error)
    res.status(400).json({ 
      message: 'Failed to update lab',
      error: error.message 
    })
  }
}

// Delete a lab
export const deleteLab = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ message: 'Lab ID is required' })
    }

    const lab = await Lab.findById(id)
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' })
    }
    await lab.deleteOne()
    res.status(200).json({ message: 'Lab deleted successfully' })
  } catch (error) {
    console.error('Error deleting lab:', error)
    res.status(500).json({ 
      message: 'Failed to delete lab',
      error: error.message 
    })
  }
}

// Book lab appointment
export const bookAppointment = async (req, res) => {
  try {
    const { labId, appointmentDate } = req.body
    const userId = req.user._id // From auth middleware

    if (!labId || !appointmentDate) {
      return res.status(400).json({ message: 'Lab ID and appointment date are required' })
    }

    const lab = await Lab.findById(labId)
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' })
    }

    const appointment = new LabAppointment({
      lab: labId,
      user: userId,
      appointmentDate,
      amount: lab.price
    })

    const newAppointment = await appointment.save()
    res.status(201).json(newAppointment)
  } catch (error) {
    console.error('Error booking appointment:', error)
    res.status(400).json({ 
      message: 'Failed to book appointment',
      error: error.message 
    })
  }
}

// Get user's lab appointments
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user._id // From auth middleware
    const appointments = await LabAppointment.find({ user: userId })
      .populate('lab')
      .sort({ appointmentDate: -1 })
    res.status(200).json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    res.status(500).json({ 
      message: 'Failed to fetch appointments',
      error: error.message 
    })
  }
}

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ message: 'Appointment ID is required' })
    }

    const { status, paymentStatus, paymentId } = req.body
    const appointment = await LabAppointment.findById(id)
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    appointment.status = status || appointment.status
    appointment.paymentStatus = paymentStatus || appointment.paymentStatus
    appointment.paymentId = paymentId || appointment.paymentId

    const updatedAppointment = await appointment.save()
    res.status(200).json(updatedAppointment)
  } catch (error) {
    console.error('Error updating appointment status:', error)
    res.status(400).json({ 
      message: 'Failed to update appointment status',
      error: error.message 
    })
  }
} 