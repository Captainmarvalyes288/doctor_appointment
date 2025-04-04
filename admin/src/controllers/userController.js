export const login = async (req, res) => {
  try {

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: 'dummy-token'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
}; 