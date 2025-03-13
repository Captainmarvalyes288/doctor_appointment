import { createPaymentOrder, verifyPayment } from '../utils/razorpay.js';
import LabAppointment from '../models/labAppointmentModel.js';
import MedicineOrder from '../models/medicineOrderModel.js';

// Create payment order for lab appointment
export const createLabAppointmentPayment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await LabAppointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed for this appointment' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot process payment for cancelled appointment' });
    }

    const order = await createPaymentOrder(appointment.amount);
    res.status(200).json(order);
  } catch (error) {
    console.error('Lab appointment payment creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment order' });
  }
};

// Create payment order for medicine order
export const createMedicineOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await MedicineOrder.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed for this order' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot process payment for cancelled order' });
    }

    const paymentOrder = await createPaymentOrder(order.totalAmount);
    res.status(200).json(paymentOrder);
  } catch (error) {
    console.error('Medicine order payment creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment order' });
  }
};

// Verify and process payment for lab appointment
export const verifyLabAppointmentPayment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment verification parameters' });
    }

    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const appointment = await LabAppointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed for this appointment' });
    }

    appointment.paymentStatus = 'completed';
    appointment.status = 'confirmed';
    appointment.paymentId = razorpay_payment_id;
    appointment.paymentOrderId = razorpay_order_id;
    await appointment.save();

    res.status(200).json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Lab appointment payment verification error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify payment' });
  }
};

// Verify and process payment for medicine order
export const verifyMedicineOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment verification parameters' });
    }

    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const order = await MedicineOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed for this order' });
    }

    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    order.paymentId = razorpay_payment_id;
    order.paymentOrderId = razorpay_order_id;
    await order.save();

    res.status(200).json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Medicine order payment verification error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify payment' });
  }
}; 