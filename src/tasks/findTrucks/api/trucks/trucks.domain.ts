import { DataTypes } from "sequelize";
import sequelize from "@/db/config.js";

const Truck = sequelize.define(
  "trucks",
  {
    truck_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    license_plate_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: false,
  }
);

export default Truck;
