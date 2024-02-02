// associations.js
import Task from "./models/task";
import SubTask from "./models/subTask";
import User from "./models/user";

function defineAssociations() {
  SubTask.belongsTo(Task, { foreignKey: "task_id" });
  Task.hasMany(SubTask, { foreignKey: "task_id" });

  
  Task.belongsTo(User, { foreignKey: "user_id" });
  User.hasMany(Task, { foreignKey: "user_id",onDelete:'cascade' });
}

export default defineAssociations;
