const catchError = require('../utils/catchError');
const User = require('../models/User');
const Code = require('../models/EmailCode')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');

const getAll = catchError(async(req, res) => {
    const users = await User.findAll();
    return res.json(users)
});
const create = catchError(async(req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({...req.body, password: hashedPassword});
    const code = require('crypto').randomBytes(32).toString("hex")
    await sendEmail({
        to: 'cbermudezg7@gmail.com',
        subject: 'Email de prueba',
        html: `<h5>Link: </h5><a href="${process.env.FRONT_URL}#/verify_email/${code}">Verifica tu email</a>`
    })
    const createCode = await Code.create({
        code,
        userId: user.id
    });
    return res.status(201).json({user,createCode})
});
const getOne = catchError(async(req, res) => {
    const { id } = req.params
    const user = await User.findByPk(id)
    return res.json(user)
});
const logedUser = catchError(async(req, res) => {
    return res.json(req.user)
});
const login = catchError(async(req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email:email }})
    if(!user) return res.status(401).json({message: "Invalid Credentials"})
    if(!user.isVerified) return res.status(401).json({message: "Usuario no verificado!"})
    const isValid = await bcrypt.compare(password, user.password)
    if(!isValid) return res.status(401).json({message: "Invalid Credentials"})

    const token = jwt.sign(
		{ user }, 
		process.env.TOKEN_SECRET, 
		{ expiresIn: '1d' }
    )
    return res.json({user, token})
});
const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: { id:id }});
    return res.sendStatus(204);
});
const update = catchError(async(req, res) => {
    const { id } = req.params;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.update({...req.body, password: hashedPassword},{ where: { id: id }, returning: true });
    return res.json(user)
});
const verifyCode = catchError(async(req, res)=>{
    const { code } = req.params;
    const emailCode = await EmailCode.findOne({ where: { code } })
    if(!emailCode) return res.status(401).json('Invalid Code')
    await User.update({ isVerified : true }, { where: { id : emailCode.userId } })
    await emailCode.destroy()
    return res.json(emailCode);
})
const resetPassword = catchError(async(req, res)=>{
    const { email } = req.body;
    const user = await User.findOne({ where: { email } })
    if(!user) return res.status(401).json('El usuario no existe!')
    const code = require('crypto').randomBytes(32).toString("hex")
    await sendEmail({
        to: email,
        subject: 'Recuperación de contraseña',
        html: `<h5>Link: </h5><a href="${process.env.FRONT_URL}#/reset_password/${code}">Recupera tu contraseña</a>`
    })
    const createCode = await Code.create({
        code,
        userId: user.id
    });
    return res.json({user, createCode});
})
const resetPasswordCode = catchError(async(req, res)=>{
    const { code } = req.params;
    const { password } = req.body;
    const emailCode = await EmailCode.findOne({ where: { code } })
    if(!emailCode) return res.status(401).json('Invalid Code')
    const encripted = await bcrypt.hash(password, 10)
    await User.update({ password : encripted }, { where: { id : emailCode.userId } })
    await emailCode.destroy()
    return res.json(emailCode);
})
module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    login,
    logedUser,
    verifyCode,
    resetPassword,
    resetPasswordCode
}