import sequelize from "@/db/config.js";

import truckRoutes from "#tasks/findTrucks/api/trucks/trucks.routes.js";
import express from "express";
import "@/models/index.js";
import { calculateTopResult } from "#tasks/calculateToP/index.js";

const app = express();

app.use(express.json());

app.use("/api/trucks", truckRoutes);
app.use("/api/calculateToP", (req, res) => {
  const { baselineTop, podLateDays, epodLateDays } = req.query;
  if (!baselineTop || !podLateDays || !epodLateDays) {
    return res.status(400).json({
      error: "Missing parameters: baselineTop, podLateDays, epodLateDays",
    });
  }

  const result = calculateTopResult(
    Number(baselineTop),
    Number(podLateDays),
    Number(epodLateDays)
  );

  return res.status(200).json({
    result: result,
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;

sequelize
  .sync({ alter: true })
  .then(() => console.log("Database synced!"))
  .catch((err) => console.error("Sync error:", err));
