const express = require('express')
const route = express.Router()

const userController = require('./user-controller');
const VerifyJwtToken = require('../../app/jwt/verifyAccessToken');
const {uploadFile} =require('../middleware/upload-file');

//Add New user//Admin
route.post('/userRegistration',userController.userRegistration);
//Add direct//User
route.post('/addNewMember',VerifyJwtToken,userController.addNewMember);

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
route.put('/updateUserData/:user_id',VerifyJwtToken,userController.updateUserData);
//Delete a user 
route.delete('/deleteUserAccount/:user_id',VerifyJwtToken,userController.deleteUserData);
//Search User
route.get('/searchUser',VerifyJwtToken,userController.searchUser);
//Add wallet
route.post('/addWallet/:user_id',VerifyJwtToken,userController.addWallet);
//Update wallet
route.put('/updateWallet/:walletId',VerifyJwtToken,userController.updateWallet);

//Get my direct
route.get('/getMyReferrals/:userId',VerifyJwtToken,userController.getMyReferrals);

//Add files (flyers/ppt/agreement)
route.patch('/addFiles/:userId',VerifyJwtToken,uploadFile.fields([{ name: 'flyers', maxCount: 10 }, { name: 'ppt', maxCount: 10 },{ name: 'agreement', maxCount: 1 }]),userController.addFiles);
//Read file
route.get('/getFile/:filename',VerifyJwtToken,userController.getFile);

//Add binary
route.post('/addBinary',userController.addBinary);
//Get binary
route.post('/getBinaryByUser/:userId',userController.getBinaryByUser);

//Raise Ticket
route.post('/raiseTicket',userController.raiseTicket);
//Get ticket of a user
route.get('/getTicketsByUser/:userId',userController.getTicketsByUser);

//Generate e-pin
route.post('/generateEpin',userController.generateEpin);
//Transfer e-pin
route.post('/transferEpin',userController.transferEpin);



module.exports = route; 