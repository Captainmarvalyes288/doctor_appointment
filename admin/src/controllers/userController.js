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
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientName, slotDate } = req.body;
    const appointment = new AppointmentModel({
      doctorId,
      patientName,
      slotDate,
    });
    await appointment.save();
    res.status(200).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export const getAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.find({});
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}