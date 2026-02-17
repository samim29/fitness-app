const Goal = require("../models/Goal");

const setGoal = async (req, res) => {
  try {
    const { targetDistance, weekStartDate } = req.body;
    
    const existingGoal = await Goal.findOne({
    user: req.user.id,
    weekStartDate
    });

    if (existingGoal) {
    return res.status(400).json({ message: "Goal already exists for this week" });
    }

    const goal = await Goal.create({
      user: req.user.id,
      targetDistance,
      weekStartDate,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const Workout = require("../models/Workout");

const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: "No goal found" });
    }

    const workouts = await Workout.find({
      user: req.user.id,
      date: { $gte: goal.weekStartDate },
    });

    const totalDistance = workouts.reduce(
      (sum, workout) => sum + workout.distance,
      0
    );

    const progress = (totalDistance / goal.targetDistance) * 100;

    res.json({
      goal,
      totalDistance,
      progress: Math.min(progress, 100),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { setGoal, getGoal };