const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  quantity: { type: Number, required: true, min: 1 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  purpose: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Returned', 'Overdue'], 
    default: 'Pending' 
  },
  actualReturnDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);