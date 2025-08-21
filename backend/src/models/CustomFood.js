import mongoose from 'mongoose';

const CustomFoodSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  unitType: {
    type: String,
    enum: ['g', 'ml', 'portion'],
    required: true
  },
  groups: [{
    type: String,
    enum: ['Céréales', 'Protéines', 'Légumineuses', 'Laitiers', 'Fruits', 'Légumes', 'Matières grasses', 'Boissons']
  }],
  kcalPer100: {
    type: Number,
    required: true
  },
  protPer100: {
    type: Number,
    required: true
  },
  carbsPer100: {
    type: Number,
    required: true
  },
  fatPer100: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('CustomFood', CustomFoodSchema);