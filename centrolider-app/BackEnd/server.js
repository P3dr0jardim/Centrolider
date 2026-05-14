require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

connectDB();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o)))
        return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/centrolider/uploads",
  express.static(path.join(__dirname, "uploads")),
);

const router = require("express").Router();
router.use("/auth", require("./src/routes/auth"));
router.use("/users", require("./src/routes/users"));
router.use("/fleets", require("./src/routes/fleets"));
router.use("/vehicles", require("./src/routes/vehicles"));
router.use("/expenses", require("./src/routes/expenses"));
router.use("/revenues", require("./src/routes/revenues"));
router.use("/stock", require("./src/routes/stock"));
router.use("/schedules", require("./src/routes/schedules"));
router.use("/stats", require("./src/routes/stats"));
router.use("/logs", require("./src/routes/logs"));
router.use("/notifications", require("./src/routes/notifications"));

// /centrolider/api → production (Passenger); /api → local dev
app.use("/centrolider/api", router);
app.use("/api", router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
