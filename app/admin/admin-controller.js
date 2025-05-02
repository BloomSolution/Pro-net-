const admins = require('../admin/admin-model');
var validator = require("email-validator");
const adminService = require('../services/admin-services');
const jwtTokenService = require('../services/jwt-service');
const refresh = require('../jwt/refresh-model');
const bcrypt = require('bcrypt');
const userService = require('../services/user-services');
const users = require('../user/user-model');
const moment = require('moment');
const mongoose = require('mongoose');
const Ticket = require('../models/ticket-model');

//Add New admin Account START
exports.adminRegistration = async (req, res) => {
    try {
        const { name,email,password} = req.body;

        if (!name||!email || !password ) {
            return res.status(406).json({ Status: false, message: 'Name ,Email and password are required fields!' });
        }

        if (validator.validate(email) !== true) {
            return res.status(400).json({ Status: false, message: 'Email is not valid' });
        }

        const existingAdmin = await adminService.adminFindAccount(email);
        if (existingAdmin) {
            return res.status(400).json({ Status: false, message: 'This email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let data = {};
        data = {
            name:name,
            email: email,
            password: hashedPassword
        };
      
        const response = await adminService.adminCreateAccount(data);
        const Authorization = jwtTokenService.generateJwtToken({ user_id: response._id, LoggedIn: true });
        await jwtTokenService.storeRefreshToken(Authorization, response._id);
        const findToken = await refresh.findOne({ user_id: response._id }).select('_id');
        await admins.findByIdAndUpdate(
            response._id,
            { $push: { tokens: findToken._id } },
            { new: true }
        );
        const updatedAdmin = await admins.findById(response._id)
        //.populate('tokens');
        return res.status(200).json({Status: true,message: 'Admin registered successfully!',data:updatedAdmin});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ Status: false, message: 'Internal Server Error' });
    }
};
//Add New admin Account END

//login admin START
exports.loginAdmin = async (req, res) => {
    try {
        const {email,password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: false, message: 'Email and password are required.' });
        }

        const admin  = await adminService.adminFindAccount(email);
        if (!admin) {
            return res.status(404).json({ status: false, message: 'The email/password is invalid.' });
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: false, message: 'The email/password is invalid.' });
        }
        // const newAccessToken = jwtTokenService.generateJwtToken({
        //     user_id: user._id,
        //     LoggedIn: true,
        // });
       // await jwtTokenService.updateRefreshToken(user._id, newAccessToken);

       console.log("admin",admin)
        return res.status(200).json({
            status: true,
            message: 'Login successful!',
            //user_id:user._id,
            admin
           // accessToken: newAccessToken
        });
    } catch (err) {
        console.log('err', err.message);
        return res.status(400).json({ Status: 'Error', message: 'somthing went wrong' })
    }
}
//login admin END

//Get all admin START
exports.getAllAdmin = async (req, res) =>{
    try {
        const admins = await adminService.getAllAdminDetails();
        res.status(200).json(admins);        
    } catch (error) {
        console.log('err', err.message);
        return res.status(400).json({ Status: 'Error', message: 'somthing went wrong' })
    }
}
//Get all admin END

//Get a admin START
exports.getAdmin = async (req, res) => {
    try {
        let { admin_id } = req.params;
        let data = await adminService.findAndGetAdminAccount(admin_id);

        if (!data || !data.data) {
            return res.status(404).json({ Status: false, message: 'Admin Account Not Found' });
        }
        return res.status(200).json({
            Status: true,
            message: 'Get admin account successful!',
            data,
        });

    } catch (error) {
        console.error("Error in get:", error);
        return res.status(500).json({ Status: false, message: 'Server Error', error: error.message });
    }
};
//Get a admin END


// Edit password START
exports.editAdminPassword = async (req, res) => {
  try {
    const { admin_id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both old and new passwords are required' });
    }

    // Find admin by ID
    const admin = await admins.findById(admin_id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare old password with hashed password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); 
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
//Edit password END

//Update admin START
exports.updateAdminData = async (req, res) => {
    try {
        let { admin_id } = req.params;
        const { name,email,password } = req.body;
          
        if (email && !validator.validate(email)) {
            return res.status(400).json({ Status: false, message: 'Email is not valid' });
        }

        const existingAdmin = await adminService.adminFindAccount(email);
        if (existingAdmin) {
            return res.status(400).json({ Status: false, message: 'This email already exists' });
        }

        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const data1 = {
            name: name || undefined,
            email: email || undefined,
            password: hashedPassword || undefined,           
        };

        const result = await adminService.updateAdminInfo(admin_id, data1);

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
//Update admin END

//Delete admin START
exports.deleteAdminData = async (req, res) =>{
    try {
        let { admin_id } = req.params
        let data = await adminService.findAndDeleteAdminAccount(admin_id)
        if (data) {
            console.log("Delete Admin Data ", data)
            return res.status(200).json({ Status: true, message: 'Account delete successfully', data })
        } else {
            return res.status(404).send({ Status: false, message: 'Not Found Admin Account' })
        }
    } catch (err) {
        console.log("Delete account error", err);
        return res.status(400).json({ Status: false, message: 'sorry! somthing went wrong' })
    }  
}
//Delete admin END

//Activate affilite START
exports.activateAffiliate = async (req, res) => {
  try {
    const { admin_id } = req.params;
    const { user_id } = req.body;

    if (!admin_id || !user_id) {
      return res.status(400).json({ Status: false, message: "Admin ID and User ID are required." });
    }

    // Validate admin
    const adminResponse = await adminService.findAndGetAdminAccount(admin_id);
    if (!adminResponse.Status) {
      return res.status(404).json({ Status: false, message: "Admin not found" });
    }

    // Subscription logic
    const amount_of_subscription = 60;
    const point_value = (60 * 70) / 100; // 42 PV
    const bonus = point_value * 0.10;     // 4.2 USD
    const today = moment().startOf('day').toDate();
    const endDate = moment(today).add(1, 'year').toDate();

    // Fetch current user
    const user = await users.findById(user_id);
    if (!user) {
      return res.status(404).json({ Status: false, message: "User not found." });
    }

    const newTotalBonus = (user.total_bonus || 0) + bonus;

    // Update user with $push and $set
    const result = await users.findByIdAndUpdate(
      user_id,
      {
        $set: {
          user_status: "Active",
          user_activate_admin_id: admin_id,
          amount_of_subscription,
          bonus_of_subscription: bonus,
          total_bonus: newTotalBonus
        },
        $push: {
          subscription_date: today,
          point_value_of_subscription: point_value,
          subscription_end_date: endDate
        }
      },
      { new: true }
    );

    return res.status(200).json({
      Status: true,
      message: 'User activated and subscription added successfully!',
      updatedUser: result
    });

  } catch (err) {
    console.log("Activate Affiliate Error:", err);
    return res.status(500).json({ Status: false, message: 'Something went wrong', error: err.message });
  }
};
//Activate affilite END

//Inactivate affilite START
exports.inactivateUserByAdmin = async (req, res) => {
  try {
    const { user_id, admin_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(admin_id)) {
      return res.status(400).json({ Status: false, message: 'Invalid user_id or admin_id' });
    }

    const userResult = await userService.findAndGetUserAccount(user_id);
    if (!userResult || !userResult.Status || !userResult.data) {
      return res.status(404).json({ Status: false, message: 'User not found' });
    }

    const user = userResult.data;

    const now = new Date();
    const subscriptionEndDates = user.subscription_end_date || [];

    // Get the latest subscription_end_date
    const lastEndDate = subscriptionEndDates.length > 0
      ? new Date(subscriptionEndDates[subscriptionEndDates.length - 1])
      : null;

    if (!lastEndDate || lastEndDate >= now) {
      return res.status(400).json({
        Status: false,
        message: 'User subscription is still active or subscription end date is invalid.',
      });
    }

    const existingAdminList = Array.isArray(user.user_inActivate_admin_id)
      ? user.user_inActivate_admin_id
      : [];

    const alreadyAdded = existingAdminList.some(id => id.toString() === admin_id);

    const updatePayload = {
      user_status: 'Inactive',
    };

    if (!alreadyAdded) {
      updatePayload.user_inActivate_admin_id = [...existingAdminList, admin_id];
    }

    const result = await userService.updateUserInfo(user_id, updatePayload);

    return res.status(200).json({
      Status: true,
      message: 'User successfully inactivated by admin.',
      updatedUser: result.result,
    });

  } catch (error) {
    console.error('Error inactivating user:', error);
    return res.status(500).json({
      Status: false,
      message: 'Server error while inactivating user.',
      error: error.message,
    });
  }
}; 
//Inactivate affilite END


// Get all tickets START
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find() 
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
//Get all tickets END

//Updates ticket status START
exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, message: 'Status updated', ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket status:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
//Updates ticket status END


//Block affilite START

//Block affilite END