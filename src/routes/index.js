const express = require('express');
const usersRouter = require('./users.router');
const router = express.Router();

// colocar las rutas aquí
router.use('/users', usersRouter);

module.exports = router;