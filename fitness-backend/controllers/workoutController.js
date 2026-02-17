const Workout = require("../models/Workout");

const addWorkout = async (req, res) => {
  try {
    const { date, distance, duration, intensity } = req.body;
    if (!date || !distance || !duration) {
      return res.status(400).json({ message: "All fields required" });
    }

    // simple calorie formula
    const calories = distance * 60;

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
