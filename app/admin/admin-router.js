const express = require('express')
const route = express.Router()

const adminController = require('./admin-controller');
const VerifyJwtToken = require('../../app/jwt/verifyAccessToken');

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
route.put('/updateAdminData/:admin_id',VerifyJwtToken,adminController.updateAdminData);
//Delete a admin 
route.delete('/deleteAdminAccount/:admin_id',VerifyJwtToken,adminController.deleteAdminData);

module.exports = route; 
