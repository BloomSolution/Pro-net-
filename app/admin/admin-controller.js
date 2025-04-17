const admins = require('../admin/admin-model');
var validator = require("email-validator");
const adminService = require('../services/admin-services');
const jwtTokenService = require('../services/jwt-service');
const refresh = require('../jwt/refresh-model');
const bcrypt = require('bcrypt');

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
        const { name, email,password } = req.body;
          
        if (email && !validator.validate(email)) {
            return res.status(400).json({ Status: false, message: 'Email is not valid' });
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
