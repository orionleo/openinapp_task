import { DataTypes, Model } from "sequelize";
import sequelize from ".."; // Import the Sequelize instance
import Task from "./task"; // Import the Task model
import User from "./user";

interface SubTaskAttributes {
  id?: string;
  task_id: string;
  status: 0 | 1;
}

class SubTask extends Model<SubTaskAttributes> {
  declare id: string;
  declare task_id: bigint;
  declare status: number;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deleteAt: Date;
}

SubTask.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[0, 1]],
      },
    },
  },
  {
    sequelize,
    tableName: "SubTask",
    paranoid: true,
  }
);

// Define associations
// SubTask.belongsTo(Task,{foreignKey:'task_id'})

export default SubTask;
