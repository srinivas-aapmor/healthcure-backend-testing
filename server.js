const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

dotenv.config();
connectDB();
// app.use(cors()); // enable CORS

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
 app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
