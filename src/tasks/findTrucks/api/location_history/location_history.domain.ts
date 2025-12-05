import { DataTypes } from "sequelize";
import sequelize from "@/db/config.js";

const LocationHistory = sequelize.define(
  "location_history",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    truck_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    location_point: {
      type: DataTypes.GEOMETRY("POINT", 4326),
      allowNull: false,
      // Optional getter for convenience:
      get() {
        const value = this.getDataValue("location_point");
        if (!value) return null;
        return {
          latitude: value.coordinates[1],
          longitude: value.coordinates[0],
        };
      },
    },
  },
  {
    tableName: "location_history",
    timestamps: false,

    indexes: [
      // MOST IMPORTANT: composite index truck_id + timestamp DESC
      {
        name: "idx_truck_timestamp",
        fields: ["truck_id", { name: "timestamp", order: "DESC" }],
      },

      // Timestamp
      { name: "idx_timestamp", fields: ["timestamp"] },

      // Latitude / Longitude (pre-filter bounding box)
      { name: "idx_latitude", fields: ["latitude"] },
      { name: "idx_longitude", fields: ["longitude"] },

      // Spatial index
      {
        name: "idx_location_point",
        type: "SPATIAL",
        fields: ["location_point"],
      },
    ],
  }
);

export default LocationHistory;
