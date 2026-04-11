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
  // Relational references
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
  // Task State
  status: { 
    type: String, 
    enum: ['open', 'accepted', 'completed'], 
    default: 'open' 
  },
  // Geospatial Data (GeoJSON)
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      required: true,
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], // [longitude, latitude]
      required: true,
      // Validation to ensure correct GeoJSON format
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
  // Review System
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

// CRITICAL: This allows you to find tasks within X km of a user
TaskSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Task', TaskSchema);