import { Router } from "express";
import sequelize from "@/db/config.js";
import { loadSQL } from "#utils/load-sql.js";

const router = Router();

// GET /api/trucks/nearby?lat=...&lng=...&radius=...
router.get("/nearby", async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng || !radius) {
    return res.status(400).json({
      error: "Missing parameters: lat, lng, radius",
    });
  }

  const query = loadSQL("performance.sql");

  try {
    const results = await sequelize.query(query, {
      replacements: {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
        radius: parseFloat(radius as string),
      },
      type: "SELECT",
    });

    res.json(results);
  } catch (err: any) {
    res.status(500).json({
      error: "Query failed",
      details: err.message,
    });
  }
});

export default router;
