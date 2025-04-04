import jwt from 'jsonwebtoken';
import process from 'process';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Add proper doctor authentication with database
    // For now, using dummy data
    const dummyDoctor = {
      id: 1,
      email: 'doctor@example.com',
      password: 'doctor123',
      name: 'Dr. John Doe',
      specialization: 'Cardiologist'
    };

    if (email !== dummyDoctor.email || password !== dummyDoctor.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid doctor credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: dummyDoctor.id, email: dummyDoctor.email, role: 'doctor' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Doctor login successful',
      token,
      data: {
        id: dummyDoctor.id,
        name: dummyDoctor.name,
        email: dummyDoctor.email,
        specialization: dummyDoctor.specialization,
        role: 'doctor'
      }
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Doctor login failed'
    });
  }
};

export const listDoctors = async (req, res) => {
  try {
    // TODO: Add proper database query here
    // For now, return dummy data
    const doctors = [
      {
        id: 1,
        name: 'Dr. John Doe',
        specialization: 'Cardiologist',
        experience: '10 years'
      },
      {
        id: 2,
        name: 'Dr. Jane Smith',
        specialization: 'Pediatrician',
        experience: '8 years'
      }
    ];

    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
}; 