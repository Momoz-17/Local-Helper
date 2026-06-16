const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, 
  acceptedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }, 
  status: { 
    type: String, 
    enum: ['open', 'accepted', 'completed'], 
    default: 'open' 
  },
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      required: true,
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], 
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2;
        },
        message: 'Coordinates must contain [longitude, latitude]'
      }
    } 
  },
  address: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    default: null 
  },
  feedback: { 
    type: String, 
    default: ""
  }
}, { 
  timestamps: true 
});

TaskSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Task', TaskSchema);