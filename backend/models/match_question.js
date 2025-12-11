const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Match_Question = sequelize.define(
    "Match_Question",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      match_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Matches",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Questions",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      question_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Match_Questions",
      timestamps: true,
    }
  );

  Match_Question.associate = (models) => {
    Match_Question.belongsTo(models.Match, {
      foreignKey: "match_id",
      as: "match",
    });
    Match_Question.belongsTo(models.Question, {
      foreignKey: "question_id",
      as: "question",
    });
  };

  return Match_Question;
};