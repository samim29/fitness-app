const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const port = process.env.PORT || 8080;

dotenv.config();
connectDB();


const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/workouts", require("./routes/workoutRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));

app.get("/",(req,res)=>{
    res.send("Api is running...");
})


app.listen(port,()=>{
    console.log(`Server is listening to ${port}`);
})