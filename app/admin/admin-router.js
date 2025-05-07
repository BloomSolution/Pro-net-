const express = require('express')
const route = express.Router()

const adminController = require('./admin-controller');
const VerifyJwtToken = require('../../app/jwt/verifyAccessToken');
const {uploadAdminProfile} =require('../middleware/admin-profile-img');

//Add New admin
route.post('/adminRegistration',adminController.adminRegistration);
//Login admin
route.post('/loginAdmin',adminController.loginAdmin);
//Get all admin
route.get('/getAllAdmin',VerifyJwtToken,adminController.getAllAdmin);
//Get a admin
route.get('/getAdmin/:admin_id',VerifyJwtToken,adminController.getAdmin);
//edit admin Password 
route.patch('/editAdminPassword/:admin_id',VerifyJwtToken,adminController.editAdminPassword);
//edit admin Profile
route.put('/updateAdminData/:admin_id',uploadAdminProfile.single('file'),VerifyJwtToken,adminController.updateAdminData);
//Delete a admin 
route.delete('/deleteAdminAccount/:admin_id',VerifyJwtToken,adminController.deleteAdminData);
//Activate User
route.post('/activateAffiliate/:admin_id',VerifyJwtToken,adminController.activateAffiliate);
//Inactivate user by Admin
route.put('/inactivateUserByAdmin/:admin_id/:user_id',VerifyJwtToken,adminController.inactivateUserByAdmin);
// Get all tickets
route.get('/getAllTickets',adminController.getAllTickets);
//Updates ticket status 
route.patch('/updateTicketStatus/:ticketId', adminController.updateTicketStatus);


//Block User by admin



module.exports = route; 
