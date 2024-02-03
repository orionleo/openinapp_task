import { DataTypes, Model } from "sequelize";
import sequelize from ".."; // Import the Sequelize instance
import Task from "./task";

interface UserAttributes {
  id?: string;
  phone_number: bigint;
  priority: number;
}

class User extends Model<UserAttributes> {
  declare id?: string;
  declare phone_number: bigint;
  declare priority: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[0, 1, 2]],
      },
    },
  },
  {
    sequelize,
    tableName: "User",
  }
);

export default User;
