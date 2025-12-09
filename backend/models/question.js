const { DataTypes } = require("sequelize");
const { sequelize } = require(".");
const { type } = require("os");

module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define(
        "Question", {
        question: {
            type: DataTypes.STRING,
            allowNull: false
        },
        option_a: {
            type: DataTypes.STRING,
            allowNull: false
        },
        option_b: {
            type: DataTypes.STRING,
            allowNull: false
        },
        option_c: {
            type: DataTypes.STRING,
            allowNull: false
        },
        option_d: {
            type: DataTypes.STRING,
            allowNull: false
        },
        correct_option: {
            type: DataTypes.STRING,
            allowNull: false
        },
        q_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }
    )
    
    Question.associate = (models) => {
        Question.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user"
        })
    }
    
    return Question;
}