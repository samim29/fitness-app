const Workout = require("../models/Workout");

const addWorkout = async (req, res) => {
  try {
    const { date, distance, duration, intensity } = req.body;

    // Future date validation
    if (new Date(date) > new Date()) {
      return res.status(400).json({
        message: "Workout date cannot be in the future",
      });
    }

    // Distance validation (allow decimals)
    if (!distance || distance <= 0) {
      return res.status(400).json({
        message: "Distance must be a positive number",
      });
    }

    // Duration validation (integer only)
    if (!Number.isInteger(Number(duration)) || duration <= 0) {
      return res.status(400).json({
        message: "Duration must be a positive integer",
      });
    }

    // Calories logic based on intensity
    let caloriesPerKm = 60;

    if (intensity === "low") caloriesPerKm = 50;
    if (intensity === "medium") caloriesPerKm = 60;
    if (intensity === "high") caloriesPerKm = 75;

    const calories = distance * caloriesPerKm;

    const workout = await Workout.create({
      user: req.user.id,
      date,
      distance,
      duration,
      intensity,
      calories,
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({
      user: req.user.id,
    }).sort({ date: -1 });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    // 1️⃣ Check if workout exists
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // 2️⃣ Check ownership
    if (workout.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this workout" });
    }

    // 3️⃣ Delete workout
    await workout.deleteOne();

    res.json({ message: "Workout deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { date, distance, duration, intensity } = req.body;

    if (date) workout.date = date;
    if (distance) workout.distance = distance;
    if (duration) workout.duration = duration;
    if (intensity) workout.intensity = intensity;

    // Recalculate calories if distance updated
    if (distance) {
      workout.calories = distance * 60;
    }

    const updatedWorkout = await workout.save();

    res.json(updatedWorkout);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addWorkout, getWorkouts, deleteWorkout, updateWorkout };
