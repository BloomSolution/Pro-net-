const users = require('../user/user-model');
var validator = require("email-validator");
const userService = require('../services/user-services');
const jwtTokenService = require('../services/jwt-service');
const refresh = require('../jwt/refresh-model');
const bcrypt = require('bcrypt');
const Visitor = require('../user/visitor-model');

//Add New User Account START
exports.userRegistration = async (req, res) => {
    try {
        const { email,password} = req.body;

        if (!email || !password ) {
            return res.status(406).json({ Status: false, message: 'Email and password are required fields!' });
        }

        if (validator.validate(email) !== true) {
            return res.status(400).json({ Status: false, message: 'Email is not valid' });
        }

        const existingUser = await userService.findAccount(email);
        if (existingUser) {
            return res.status(400).json({ Status: false, message: 'This email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let data = {};
        data = {
            email: email,
            password: hashedPassword
        };
      
        const response = await userService.createAccount(data);
        const Authorization = jwtTokenService.generateJwtToken({ user_id: response._id, LoggedIn: true });
        await jwtTokenService.storeRefreshToken(Authorization, response._id);
        const findToken = await refresh.findOne({ user_id: response._id }).select('_id');
        await users.findByIdAndUpdate(
            response._id,
            { $push: { tokens: findToken._id } },
            { new: true }
        );
        const updatedUser = await users.findById(response._id)
        //.populate('tokens');
        return res.status(200).json({Status: true,message: 'User registered successfully!',data:updatedUser});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ Status: false, message: 'Internal Server Error' });
    }
};
//Add New User Account END

//login user START
exports.loginUser = async (req, res) => {
    try {
        const {email,password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: false, message: 'Email and password are required.' });
        }

        const user = await userService.findAccount(email);
        if (!user) {
            return res.status(404).json({ status: false, message: 'The email/password is invalid.' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: false, message: 'The email/password is invalid.' });
        }
        // const newAccessToken = jwtTokenService.generateJwtToken({
        //     user_id: user._id,
        //     LoggedIn: true,
        // });
       // await jwtTokenService.updateRefreshToken(user._id, newAccessToken);
        return res.status(200).json({
            status: true,
            message: 'Login successful!',
            //user_id:user._id,
            user
           // accessToken: newAccessToken
        });
    } catch (err) {
        console.log('err', err.message);
        return res.status(400).json({ Status: 'Error', message: 'somthing went wrong' })
    }
}
//login user END

//Get all user START
exports.getAllUser = async (req, res) =>{
    try {
        const users = await userService.getAllUserDetails();
        res.status(200).json(users);        
    } catch (error) {
        console.log('err', err.message);
        return res.status(400).json({ Status: 'Error', message: 'somthing went wrong' })
    }
}
//Get all user END

//Get a user START
exports.getUser = async (req, res) => {
    try {
        let { user_id } = req.params;
        let data = await userService.findAndGetUserAccount(user_id);

        if (!data || !data.data) {
            return res.status(404).json({ Status: false, message: 'User Account Not Found' });
        }
        return res.status(200).json({
            Status: true,
            message: 'Get user account successful!',
            data,
        });

    } catch (error) {
        console.error("Error in get:", error);
        return res.status(500).json({ Status: false, message: 'Server Error', error: error.message });
    }
};
//Get a user END

//visitor START
exports.trackVisitor = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const existing = await Visitor.findOne({ ip });

    if (!existing) {
      // Save unique visitor
      await Visitor.create({ ip });
    }

    // Count total unique visitors
    const total = await Visitor.countDocuments();

    res.status(200).json({
      message: 'Visitor tracked',
      ip: ip,
      totalUniqueVisitors: total
    });
  } catch (err) {
    console.error('Tracking Error:', err);
    res.status(500).json({ message: 'Error tracking visitor' });
  }
};
//visitor END

// Edit password of user START
exports.editUserPassword = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both old and new passwords are required' });
    }

    // Find admin by ID
    const user = await users.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare old password with hashed password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); 
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
//Edit password of user END

//Update user START
exports.updateUserData = async (req, res) => {
    try {
        let { user_id } = req.params;
        const { email,password } = req.body;
          
        if (email && !validator.validate(email)) {
            return res.status(400).json({ Status: false, message: 'Email is not valid' });
        }

        const existingUser = await userService.findAccount(email);
        if (existingUser) {
            return res.status(400).json({ Status: false, message: 'This email already exists' });
        }

        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const data1 = {          
            email: email || undefined,
            password: hashedPassword || undefined,           
        };

        const result = await userService.updateUserInfo(user_id, data1);

        if (result.Status === true) {
            let updateData = result.result;
            return res.status(200).json({ Status: true, message: 'Updated successfully!', updateData });
        } else {
            return res.status(200).json(result);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ Status: false, message: err.message });
    }
};
//Update user END

//Delete user START
exports.deleteUserData = async (req, res) =>{
    try {
        let { user_id } = req.params
        let data = await userService.findAndDeleteUserAccount(user_id)
        if (data) {
            console.log("Delete User Data ", data)
            return res.status(200).json({ Status: true, message: 'Account delete successfully', data })
        } else {
            return res.status(404).send({ Status: false, message: 'Not Found Admin Account' })
        }
    } catch (err) {
        console.log("Delete account error", err);
        return res.status(400).json({ Status: false, message: 'sorry! somthing went wrong' })
    }  
}
//Delete user END