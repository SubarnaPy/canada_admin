const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  aboutService: {
    type: String,
    trim: true,
  },
  price: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  consultant: {
    type: String,
    required: true,
    trim: true,
  },
  consultantTitle: {
    type: String,
    required: true,
    trim: true,
  },
  features: [{
    type: String,
    trim: true,
  }],
  icon: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
serviceSchema.index({ serviceId: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
