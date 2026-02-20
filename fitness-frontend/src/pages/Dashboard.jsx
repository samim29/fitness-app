import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [goalData, setGoalData] = useState(null);

  const [date, setDate] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("medium");

  const [targetDistance, setTargetDistance] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editWorkout, setEditWorkout] = useState(null);

  const [editDate, setEditDate] = useState("");
  const [editDistance, setEditDistance] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editIntensity, setEditIntensity] = useState("medium");

  // ================= HELPERS =================

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} mins`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} mins`;
  };

  const formatPace = (pace) => {
    if (!pace || pace === 0) return "0:00";
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")} min/km`;
  };

  const calculateWorkoutPace = (distance, duration) => {
    if (!distance || distance === 0) return 0;
    return duration / distance;
  };

  // ================= FETCH DATA =================

  const fetchAllData = async () => {
    try {
      const workoutsRes = await API.get("/workouts");
      setWorkouts(workoutsRes.data);

      try {
        const goalRes = await API.get("/goals");
        setGoalData(goalRes.data);
      } catch {
        setGoalData(null);
      }
    } catch {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ================= EDIT =================

  const handleEditClick = (workout) => {
    setEditWorkout(workout);
    setEditDate(workout.date.split("T")[0]);
    setEditDistance(workout.distance);
    setEditDuration(workout.duration);
    setEditIntensity(workout.intensity);
    setIsEditOpen(true);
  };

  const handleUpdateWorkout = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/workouts/${editWorkout._id}`, {
        date: editDate,
        distance: Number(editDistance),
        duration: Number(editDuration),
        intensity: editIntensity,
      });
      setIsEditOpen(false);
      await fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update workout");
    }
  };

  // ================= ADD =================

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    try {
      await API.post("/workouts", {
        date,
        distance: Number(distance),
        duration: Number(duration),
        intensity,
      });
      await fetchAllData();
      setDate("");
      setDistance("");
      setDuration("");
      setIntensity("medium");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add workout");
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    try {
      await API.delete(`/workouts/${id}`);
      await fetchAllData();
    } catch {
      alert("Failed to delete workout");
    }
  };

  // ================= GOAL =================

  const handleSetGoal = async (e) => {
    e.preventDefault();
    try {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      await API.post("/goals", {
        targetDistance: Number(targetDistance),
        weekStartDate: monday,
      });

      await fetchAllData();
      setTargetDistance("");
    } catch {
      alert("Failed to set goal");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const getChartData = () => {
    if (!goalData?.distanceByDay) return [];

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return weekDays.map((day) => ({
      day,
      distance: goalData.distanceByDay[day] || 0,
    }));
  };
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow rounded border">
          <p className="font-semibold">{label}</p>
          <p className="text-blue-600">{payload[0].value.toFixed(1)} km</p>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">FitTrack</h2>

        <nav className="space-y-4">
          <button className="block text-left w-full text-gray-700 hover:text-blue-600">
            Dashboard
          </button>
          <button className="block text-left w-full text-gray-700 hover:text-blue-600">
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="block text-left w-full text-red-500 hover:text-red-600"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* ================= STATS ================= */}
          {goalData && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Distance */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow hover:scale-105 transition-transform">
                <p className="text-sm opacity-80">Distance</p>
                <h2 className="text-2xl font-bold mt-2">
                  {goalData.totalDistance.toFixed(1)} km
                </h2>
              </div>

              {/* Calories */}
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-xl shadow hover:scale-105 transition-transform">
                <p className="text-sm opacity-80">Calories</p>
                <h2 className="text-2xl font-bold mt-2">
                  {Math.round(goalData.totalCalories).toLocaleString()} kcal
                </h2>
              </div>

              {/* Sessions */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl shadow hover:scale-105 transition-transform">
                <p className="text-sm opacity-80">Sessions</p>
                <h2 className="text-2xl font-bold mt-2">
                  {goalData.totalWorkouts}
                </h2>
              </div>

              {/* Pace */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-xl shadow hover:scale-105 transition-transform">
                <p className="text-sm opacity-80">Avg Pace</p>
                <h2 className="text-2xl font-bold mt-2">
                  {formatPace(goalData.averagePace)}
                </h2>
              </div>
            </div>
          )}
          {/* ================= CHART ================= */}
          {goalData && (
            <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Weekly Activity
                  </h2>
                  <p className="text-sm text-gray-500">
                    Distance trend (Mon - Sun)
                  </p>
                </div>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="day"
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />

                  <Tooltip content={<CustomTooltip />} />

                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* ================= GOAL ================= */}
          {goalData ? (
            <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Weekly Goal
                </h2>

                <span className="text-sm text-gray-500">
                  {Math.round(goalData.progress)}%
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Target</p>
                  <p className="font-semibold text-gray-800">
                    {goalData.goal.targetDistance} km
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="font-semibold text-green-600">
                    {goalData.totalDistance.toFixed(1)} km
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="font-semibold text-blue-600">
                    {Math.max(
                      goalData.goal.targetDistance - goalData.totalDistance,
                      0,
                    ).toFixed(1)}{" "}
                    km
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${goalData.progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
              <h2 className="text-lg font-semibold mb-4">Set Weekly Goal</h2>

              <form onSubmit={handleSetGoal} className="flex gap-4">
                <input
                  type="number"
                  min="1"
                  placeholder="Target Distance (km)"
                  value={targetDistance}
                  onChange={(e) => setTargetDistance(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />

                <button className="bg-green-600 text-white px-4 rounded hover:bg-green-700">
                  Set
                </button>
              </form>
            </div>
          )}

          {/* ================= ADD WORKOUT ================= */}
          <div className="bg-white p-6 rounded-xl shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Add Workout</h2>

            <form
              onSubmit={handleAddWorkout}
              className="grid md:grid-cols-5 gap-4"
            >
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Distance (km)"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Duration (mins)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="border p-2 rounded"
                required
              />
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button className="bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Add
              </button>
            </form>
          </div>

          {/* ================= WORKOUT LIST ================= */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <div
                key={workout._id}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                
                <p className="text-sm text-gray-500 mb-3">
                  {new Date(workout.date).toLocaleDateString()}
                </p>

                <p className="text-xl font-bold text-gray-800 mb-2">
                  {workout.distance} km
                </p>
                  {/* Details */}
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p>⏱ {formatDuration(workout.duration)}</p>
                    <p>⚡ Pace: {formatPace(calculateWorkoutPace(workout.distance, workout.duration))}</p>
                    <p>🔥 {Math.round(workout.calories).toLocaleString()} kcal</p>
                    <p>Intensity: {workout.intensity}</p>
                  </div>
              
                <div className=" flex gap-3">
                  <button
                    onClick={() => handleEditClick(workout)}
                    className="flex-1 bg-yellow-400 text-white py-1 rounded hover:bg-yellow-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(workout._id)}
                    className="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= EDIT MODAL ================= */}
        {isEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96">
              <h2 className="text-lg font-semibold mb-4">Edit Workout</h2>

              <form onSubmit={handleUpdateWorkout} className="space-y-4">
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={editDistance}
                  onChange={(e) => setEditDistance(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="number"
                  min="1"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <select
                  value={editIntensity}
                  onChange={(e) => setEditIntensity(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}

export default Dashboard;
