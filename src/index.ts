import sequelize from "@/db/config.js";

import truckRoutes from "@/tasks/db/api/trucks/trucks.routes.js";
import express from "express";
import "@/models/index.js";

const app = express();

app.use(express.json()); // Parses JSON bodies, like middleware in frontend
// Sync models
sequelize
  .sync({ alter: true }) // or force: true for testing
  .then(() => console.log("Database synced!"))
  .catch((err) => console.error("Sync error:", err));

app.use("/api/trucks", truckRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
export default app;
