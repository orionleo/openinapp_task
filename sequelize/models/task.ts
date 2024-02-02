import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../index"; // Import the Sequelize instance
import SubTask from "./subTask"; // Import the SubTask model
import User from "./user"; // Import the User model

interface TaskAttributes {
  id?: string;
  title: string;
  description: string;
  due_date: Date | string;
  priority: number;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  user_id: string;
  
}

// We're telling the Model that 'id' is optional
// when creating an instance of the model (such as using Model.create()).


class Task extends Model<TaskAttributes> {
  declare id: string;
  declare title: string;
  declare description: string;
  declare due_date: Date | string;
  declare priority: number;
  declare status: "TODO" | "IN_PROGRESS" | "DONE";
  declare user_id: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deleteAt: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[0, 1, 2, 3]],
      },
    },
    status: {
      type: DataTypes.ENUM("TODO", "IN_PROGRESS", "DONE"),
      allowNull: false,
      defaultValue: "TODO",
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Task",
    paranoid: true,
  }
);

// Define associations

export default Task;
