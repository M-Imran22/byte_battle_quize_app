const { DataTypes } = require("sequelize");
const { sequelize } = require(".");


module.exports = (sequelize,DataTypes)=>{
    const Team = sequelize.define(
        "Team",{
            id:{
                type:DataTypes.INTEGER,
                allowNull:false,
                autoIncrement: true,
                primaryKey: true
            },
            team_name:{
                type:DataTypes.STRING,
                allowNull: false
            },
            description:{
                type:DataTypes.STRING,
                allowNull: false
            },
            user_id:{
                type:DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            }
        }
    )

    Team.associate = (models) => {
        Team.hasMany(models.Team_Match,{
            foreignKey:"team_id",
            as:"rounds"
        })
        Team.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user"
        })
    }

    return Team;
}