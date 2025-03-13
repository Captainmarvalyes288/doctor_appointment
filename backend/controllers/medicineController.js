import Medicine from '../models/medicineModel.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'

// Get all medicines
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find()
    if (!medicines || medicines.length === 0) {
      return res.status(404).json({ message: 'No medicines found' })
    }
    res.status(200).json(medicines)
  } catch (error) {
    console.error('Error fetching medicines:', error)
    res.status(500).json({ 
      message: 'Failed to fetch medicines',
      error: error.message 
    })
  }
}

// Get a single medicine
export const getMedicine = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ message: 'Medicine ID is required' })
    }

    const medicine = await Medicine.findById(id)
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' })
    }
    res.status(200).json(medicine)
  } catch (error) {
    console.error('Error fetching medicine:', error)
    res.status(500).json({ 
      message: 'Failed to fetch medicine',
      error: error.message 
    })
  }
}

// Create a new medicine
export const createMedicine = async (req, res) => {
  try {
    const { image, ...medicineData } = req.body

    // Validate required fields
    const requiredFields = ['name', 'description', 'dosage', 'manufacturer', 'category', 'price']
    const missingFields = requiredFields.filter(field => !medicineData[field])
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        fields: missingFields 
      })
    }

    // Upload image to Cloudinary if provided
    let imageUrl = image
    if (image && image.startsWith('data:image')) {
      const uploadResult = await uploadToCloudinary(image)
      imageUrl = uploadResult.secure_url
    } else if (!image) {
      return res.status(400).json({ message: 'Medicine image is required' })
    }

    const medicine = new Medicine({
      ...medicineData,
      image: imageUrl
    })
    const newMedicine = await medicine.save()
    res.status(201).json(newMedicine)
  } catch (error) {
    console.error('Error creating medicine:', error)
    res.status(400).json({ 
      message: 'Failed to create medicine',
      error: error.message 
    })
  }
}

// Update a medicine
export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ message: 'Medicine ID is required' })
    }

    const medicine = await Medicine.findById(id)
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' })
    }

    const { image, ...updateData } = req.body

    // Upload new image to Cloudinary if provided
    if (image && image.startsWith('data:image')) {
      const uploadResult = await uploadToCloudinary(image)
      updateData.image = uploadResult.secure_url
    }

    Object.assign(medicine, updateData)
    const updatedMedicine = await medicine.save()
    res.status(200).json(updatedMedicine)
  } catch (error) {
    console.error('Error updating medicine:', error)
    res.status(400).json({ 
      message: 'Failed to update medicine',
      error: error.message 
    })
  }
}

// Delete a medicine
export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ message: 'Medicine ID is required' })
    }

    const medicine = await Medicine.findById(id)
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' })
    }
    await medicine.deleteOne()
    res.status(200).json({ message: 'Medicine deleted successfully' })
  } catch (error) {
    console.error('Error deleting medicine:', error)
    res.status(500).json({ 
      message: 'Failed to delete medicine',
      error: error.message 
    })
  }
} 