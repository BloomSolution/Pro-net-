const express = require('express')
const route = express.Router()

const queryController = require('./guest-query-controller');
const VerifyJwtToken = require('../../app/jwt/verifyAccessToken');

//Add Queries of guest
route.post('/addQueries',queryController.addQueries);

//Get all queries
route.get('/getAllQueries',queryController.getAllQueries);

module.exports = route;
