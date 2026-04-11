const Task = require('../models/Task');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// --- Nodemailer Transporter Configuration ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use a Gmail App Password
  },
});

// Helper function to send email
const sendAcceptanceEmail = async (seekerEmail, seekerName, taskTitle, providerName) => {
  const mailOptions = {
    from: `"Community Connect" <${process.env.EMAIL_USER}>`,
    to: seekerEmail,
    subject: `Task Accepted: ${taskTitle}`,
    html: `
      <h2>Hello ${seekerName},</h2>
      <p>Good news! Your task <strong>${taskTitle}</strong> has been accepted by <strong>${providerName}</strong>.</p>
      <p>You can now view their details in your Seeker Dashboard to coordinate the next steps.</p>
    `,
  };
  return transporter.sendMail(mailOptions);
};

// --- Controller Functions ---

// 1. Create Task (Fixed coordinate parsing)
const createTask = async (req, res) => {
  try {
    const { title, description, longitude, latitude, address } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: "Please select a location on the map." });
    }

    const ln = parseFloat(longitude);
    const lt = parseFloat(latitude);

    const newTask = new Task({
      title,
      description,
      address,
      postedBy: req.user._id, // Set by authMiddleware
      location: {
        type: 'Point',
        coordinates: [ln, lt]
      }
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Task Creation Error:", error); 
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

// 2. Get All Open Tasks (Fixed object rendering by populating)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'open' })
      .populate('postedBy', 'name phone address')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// 3. Accept Task
const acceptTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted', acceptedBy: req.user._id },
      { new: true }
    ).populate('postedBy', 'name email phone');

    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    try {
      await sendAcceptanceEmail(
        updatedTask.postedBy.email,
        updatedTask.postedBy.name,
        updatedTask.title,
        req.user.name 
      );
    } catch (mailError) {
      console.error("Email failed to send, but task was accepted:", mailError);
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Error accepting task", error: err.message });
  }
};

// 4. Get Nearby Tasks
const getNearbyTasks = async (req, res) => {
  const { lat, lng, distance = 10000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and Longitude are required" });
  }

  try {
    const tasks = await Task.find({
      status: 'open',
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance)
        }
      }
    }).populate('postedBy', 'name phone address');

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Filtering failed", error: err.message });
  }
};

// 5. Get Provider Tasks
const getProviderTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ acceptedBy: req.user._id })
      .populate('postedBy', 'name phone address')
      .sort({ updatedAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching provider tasks", error: error.message });
  }
};

// 6. Get Seeker Tasks
const getSeekerTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ postedBy: req.user._id })
      .populate('acceptedBy', 'name phone email')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seeker tasks", error: error.message });
  }
};

// 7. Complete Task
const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the seeker can confirm completion" });
    }
    task.status = 'completed';
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error completing task", error: error.message });
  }
};

// 8. Delete Task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found or unauthorized" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};

// 9. Rate Task
const rateTask = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: Only the Seeker can rate this task" });
    }

    if (task.status !== 'completed') {
      return res.status(400).json({ message: "Cannot rate a task until it is completed" });
    }

    task.rating = rating;
    task.feedback = feedback;
    
    await task.save();
    res.status(200).json({ message: "Review submitted successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Error saving rating", error: error.message });
  }
};

// 10. Provider Stats
const getProviderStats = async (req, res) => {
  try {
    const providerId = req.params.userId;

    const stats = await Task.aggregate([
      { 
        $match: { 
          acceptedBy: new mongoose.Types.ObjectId(providerId),
          status: 'completed',
          rating: { $exists: true, $ne: null }
        } 
      },
      {
        $group: {
          _id: "$acceptedBy",
          averageRating: { $avg: "$rating" },
          totalReviews: { $count: {} }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({ averageRating: 0, totalReviews: 0 });
    }

    res.status(200).json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: "Error calculating stats", error: error.message });
  }
};

// 11. Update Task
const updateTask = async (req, res) => {
  res.status(501).json({ message: "Update functionality not yet implemented" });
};

module.exports = {
  createTask,
  getTasks,
  acceptTask,
  getProviderTasks,
  getSeekerTasks,
  completeTask,
  updateTask,
  deleteTask,
  getNearbyTasks,
  rateTask,
  getProviderStats
};