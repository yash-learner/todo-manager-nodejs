"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    static getAllTodos() {
      return this.findAll();
    }

    static async overdue(userId) {
      const todos = await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
      return todos;
    }

    static async dueToday(userId) {
      const todos = await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(),
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
      return todos;
    }

    static async dueLater(userId) {
      const todos = await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
      return todos;
    }

    static async completed(userId) {
      const todos = await Todo.findAll({
        where: {
          userId,
          completed: true,
        },
        order: [["id", "ASC"]],
      });
      return todos;
    }

    static async markAsComplete(id) {
      await Todo.update(
        { completed: true },
        {
          where: {
            id: id,
          },
        }
      );
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    setCompletionStatus(status) {
      return this.update({ completed: status });
    }

    static async deleteTodo(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Todo title can not be empty" },
        },
      },
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
