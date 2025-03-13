import Lab from '../models/labModel.js'

// Get all labs
export const getAllLabs = async (req, res) => {
  try {
    const labs = await Lab.find()
    res.status(200).json(labs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single lab
export const getLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id)
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' })
    }
    res.status(200).json(lab)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new lab
export const createLab = async (req, res) => {
  try {
    const lab = new Lab(req.body)
    const newLab = await lab.save()
    res.status(201).json(newLab)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update a lab
export const updateLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id)
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' })
    }
    Object.assign(lab, req.body)
    const updatedLab = await lab.save()
    res.status(200).json(updatedLab)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete a lab
export const deleteLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id)
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' })
    }
    await lab.deleteOne()
    res.status(200).json({ message: 'Lab deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
} 