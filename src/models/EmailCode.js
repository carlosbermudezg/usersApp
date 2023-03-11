const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');
const User = require("./User");

const EmailCode = sequelize.define('emailcode', {
    code: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    //userId
});

EmailCode.belongsTo(User);
User.hasOne(EmailCode);

module.exports = EmailCode;