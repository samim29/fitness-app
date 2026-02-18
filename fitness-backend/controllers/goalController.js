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

    // Normalize week start time
    const weekStart = new Date(goal.weekStartDate);
    weekStart.setHours(0, 0, 0, 0);

    // Calculate week end (7 days after start)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Fetch workouts only within this week
    const workouts = await Workout.find({
      user: req.user.id,
      date: {
        $gte: weekStart,
        $lt: weekEnd,
      },
    });

    // Group distance by day
const distanceByDay = {};

workouts.forEach((workout) => {
  const day = new Date(workout.date).toLocaleDateString("en-US", {
    weekday: "short",
  });

  if (!distanceByDay[day]) {
    distanceByDay[day] = 0;
  }

  distanceByDay[day] += workout.distance;
});
    // Calculate totals
const totalDistance = workouts.reduce(
  (sum, workout) => sum + workout.distance,
  0
);

const totalCalories = workouts.reduce(
  (sum, workout) => sum + workout.calories,
  0
);

const totalDuration = workouts.reduce(
  (sum, workout) => sum + workout.duration,
  0
);

const totalWorkouts = workouts.length;

// Calculate progress safely
let progress = 0;
if (goal.targetDistance > 0) {
  progress = (totalDistance / goal.targetDistance) * 100;
}

// Calculate average pace (min per km)
let averagePace = 0;
if (totalDistance > 0) {
  averagePace = totalDuration / totalDistance;
}

res.json({
  goal,
  totalDistance,
  totalCalories,
  totalDuration,
  totalWorkouts,
  averagePace,
  distanceByDay,
  progress: Math.min(progress, 100),
});



  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { setGoal, getGoal };