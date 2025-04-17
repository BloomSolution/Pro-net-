const express = require('express')
const route = express.Router()

const userController = require('./user-controller');
const VerifyJwtToken = require('../../app/jwt/verifyAccessToken');

//Add New user
route.post('/userRegistration',userController.userRegistration);
//Login user
route.post('/loginUser',userController.loginUser);
//Get all user
route.get('/getAllUser',VerifyJwtToken,userController.getAllUser);
//Get a user
route.get('/getUser/:user_id',VerifyJwtToken,userController.getUser);
//Get visitor Count
route.get('/visit',VerifyJwtToken,userController.trackVisitor);
//edit user Password 
route.patch('/editUserPassword/:user_id',VerifyJwtToken,userController.editUserPassword);
//edit user Profile

//Delete user profile


module.exports = route; 
