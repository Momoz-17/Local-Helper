const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getTasks, 
  acceptTask, 
  rateTask, 
  getProviderTasks, 
  getSeekerTasks, 
  completeTask,
  updateTask,
  deleteTask,
  getNearbyTasks // Ensure this is imported
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/authMiddleware');

// 1. General Feed
router.get('/', protect, getTasks);

// 2. Location-Based Feed (NEW)
// Place this above /:id routes
router.get('/nearby', protect, getNearbyTasks);

// 3. Seeker Routes
router.post('/', protect, authorize('seeker'), createTask);
router.get('/my-requests', protect, authorize('seeker'), getSeekerTasks);
router.patch('/:id/complete', protect, authorize('seeker'), completeTask);
router.post('/:id/rate', protect, authorize('seeker'), rateTask);
router.put('/:id', protect, authorize('seeker'), updateTask);
router.delete('/:id', protect, authorize('seeker'), deleteTask);

// 4. Provider Routes
router.get('/my-tasks', protect, authorize('provider'), getProviderTasks);
router.patch('/:id/accept', protect, authorize('provider'), acceptTask);

module.exports = router;