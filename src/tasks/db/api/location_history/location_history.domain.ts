import { DataTypes } from "sequelize";
import sequelize from "@/db/config.js";
import Truck from "../trucks/trucks.domain.js";

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
      references: {
        model: Truck,
        key: "truck_id",
      },
      onDelete: "CASCADE",
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    location_point: {
      type: DataTypes.GEOMETRY("POINT", 4326),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "location_history",

    timestamps: false,
    indexes: [
      { fields: ["truck_id", "timestamp"], name: "idx_truck_timestamp" },
      { fields: ["location_point"], type: "SPATIAL", name: "spidx_location" },
    ],
  }
);

Truck.hasMany(LocationHistory, { foreignKey: "truck_id" });
LocationHistory.belongsTo(Truck, { foreignKey: "truck_id" });

export default LocationHistory;
