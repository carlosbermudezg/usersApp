const { getAll, create, getOne, remove, update, login, logedUser, verifyCode, resetPassword, resetPasswordCode } = require('../controllers/users.controller');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT')

const usersRouter = express.Router();

usersRouter.route("/")
	.get(verifyJWT,getAll)
	.post(create)
usersRouter.route("/login")
	.post(login)
usersRouter.route("/me")
	.get(verifyJWT, logedUser)
usersRouter.route("/verify/:code")
	.get(verifyCode)
usersRouter.route("/reset_password")
	.post(resetPassword)
usersRouter.route("/reset_password/:code")
	.post(resetPasswordCode)
usersRouter.route("/:id")
	.get(verifyJWT, getOne)
	.delete(verifyJWT,remove)
	.put(verifyJWT,update)

module.exports = usersRouter;