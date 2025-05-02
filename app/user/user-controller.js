const users = require('../user/user-model');
var validator = require("email-validator");
const userService = require('../services/user-services');
const jwtTokenService = require('../services/jwt-service');
const refresh = require('../jwt/refresh-model');
const bcrypt = require('bcrypt');
const Visitor = require('../models/visitor-model');
const mongoose = require('mongoose');
const wallet = require('../models/user-wallet-model');
const fileModel = require('../models/files-model'); 
const path = require('path'); 
const fs = require('fs');
const BinaryReferral = require('../models/binary-tree-model');
const Ticket = require('../models/ticket-model');
// const crypto = require('crypto');  
const { v4: uuidv4 } = require('uuid');
const Epin = require('../models/epin-model'); 
const admins = require('../admin/admin-model');
const nodemailer = require('nodemailer'); //email

//Send mail body START   //fun
async function sendWelcomeEmail(email, name) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Our Organization',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Welcome Letter</h1>
        <h2>Hi ${name || 'User'},</h2>
        
        <p>It is with great joy that I extend this warm welcome on behalf of our company's management and team. 
        I hope your journey with us will remain fruitful.</p>

        <p>I assure you of complete support from the team in executing works as directed by you. 
        I will be glad to assist you during your settling period.</p>

        <p>I welcome you once again and hope you have a memorable work stint at our organization.</p>

        <br/>
        <p>Regards,<br/>Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}
//Send mail body END  //fun

//Add New User Account START
exports.userRegistration = async (req, res) => {
    try {
        const {name,email,user_address,password,phone_no,age,gender,dob,state,city,aadhar_no} = req.body;

        if (!name||!email || !password ) {
            return res.status(406).json({ Status: false, message: 'Name ,email and password are required fields!' });
        }

        if (validator.validate(email) !== true) {
            return res.status(400).json({ Status: false, message: 'Email is not valid' });
        }

        const existingUser = await userService.findAccount(email);
        if (existingUser) {
            return res.status(400).json({ Status: false, message: 'This email already exists' });
        }

        const userPhoneNo = await users.findOne({ phone_no: phone_no }).exec();
        if (userPhoneNo) {
            return res.status(400).json({ Status: false, message: 'This user phone number already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let data = {};
        data = {
            name:name,
            email: email,
            user_address:user_address,
            password: hashedPassword,
            phone_no:phone_no,
            age:age,
            gender:gender,
            dob:dob,
            state:state,
            city:city,
            aadhar_no:aadhar_no
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

        await sendWelcomeEmail(email, name);

        return res.status(200).json({Status: true,message: 'User registered successfully!',data:updatedUser});
    } catch (err) {
        console.error(err);

        if (err.name === 'ValidationError') {
          const errors = {};
          for (let field in err.errors) {
              errors[field] = err.errors[field].message;
          }
          return res.status(400).json({Status: false,message: 'Validation failed!',errors: errors});
      }
  
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
        const { name,user_address,email,password } = req.body;
          
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
            name:name||undefined,
            user_address:user_address||undefined,       
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

//Search User START
exports.searchUser = async (req, res) =>{
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: 'Please provide a search keyword (name, email, or user ID)' });
    }

    let searchQuery = {
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ],
    };

    // If it's a valid ObjectId, also include _id in search
    if (mongoose.Types.ObjectId.isValid(keyword)) {
      searchQuery.$or.push({ _id: keyword });
    }

    const user = await users.find(searchQuery);

    if (!user.length) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
}
//Search User END

//Add wallet START
exports.addWallet = async (req, res) => {
  try {
    const { user_id } = req.params;
    const {
      wallet_type,
      account_holder_name,bank_name,account_number,ifsc_code,
      crypto_address,crypto_type,crypto_network
    } = req.body;

    if (!wallet_type) {
      return res.status(400).json({ message: 'Wallet type is required' });
    }

    const walletData = {user_id,wallet_type};

    if (wallet_type === 'bank') {
      walletData.account_holder_name = account_holder_name;
      walletData.bank_name = bank_name;
      walletData.account_number = account_number;
      walletData.ifsc_code = ifsc_code;
    } else if (wallet_type === 'crypto') {
      walletData.crypto_address = crypto_address;
      walletData.crypto_type = crypto_type;
      walletData.crypto_network = crypto_network;
    } else {
      return res.status(400).json({ message: 'Invalid wallet type' });
    }

    const wallet = await userService.createUserWallet(walletData);

    res.status(201).json({ message: 'Wallet created successfully', data: wallet});

  } catch (error) {
    console.error('Add wallet error:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
//Add wallet END

//Update wallet START
exports.updateWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const updateData = req.body;

    const walletInfo = await wallet.findByIdAndUpdate(walletId, updateData, { new: true });

    if (!walletInfo) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    res.status(200).json({ success: true, message: "Wallet updated successfully", data: walletInfo });
  } catch (err) {
    console.error("Error updating wallet:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//Update wallet END

//Add direct by User START
exports.addNewMember = async (req, res) => {
  try {
    const accessToken = req.headers['authorization']?.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Token not provided.',
      });
    }

    const user = await userService.finduserAccountdetails(accessToken);
    console.log("Referring User", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
        token: accessToken
      });
    }
    
    console.log("referred_by_user_id",user._id )
    const { name, email, user_address, password,phone_no,age,gender,dob,state,city,aadhar_no } = req.body;

    if (!name || !email || !password) {
      return res.status(406).json({
        Status: false,
        message: 'Name, email, and password are required fields!',
      });
    }

    if (!validator.validate(email)) {
      return res.status(400).json({ Status: false, message: 'Email is not valid' });
    }

    const existingUser = await userService.findAccount(email);
    if (existingUser) {
      return res.status(400).json({ Status: false, message: 'This email already exists' });
    }

    const userPhoneNo = await users.findOne({ phone_no: phone_no }).exec();
        if (userPhoneNo) {
            return res.status(400).json({ Status: false, message: 'This user phone number already exists' });
    }

    const capitalizeWords = str =>
      str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    const capitalizedName = capitalizeWords(name);
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      name: capitalizedName,
      email: email,
      user_address: user_address,
      password: hashedPassword,
      referred_by_user_id: user._id,
      phone_no:phone_no,
      age:age,
      gender:gender,
      dob:dob,
      state:state,
      city:city,
      aadhar_no:aadhar_no
    };

    const response = await userService.createAccount(data);

    const referrals = await users.findByIdAndUpdate(
      user._id,
      { 
      $push: { referrals: response._id},
      $inc: { no_of_direct_referrals : 1 }
      },
      { new: true }
     );

    const Authorization = jwtTokenService.generateJwtToken({ user_id: response._id, LoggedIn: true });
    await jwtTokenService.storeRefreshToken(Authorization, response._id);

    const findToken = await refresh.findOne({ user_id: response._id }).select('_id');
    await users.findByIdAndUpdate(
      response._id,
      { $push: { tokens: findToken._id } },
      { new: true }
    );

    const updatedUser = await users.findById(response._id);
    return res.status(200).json({ Status: true, message: 'User registered successfully!', data: updatedUser });

  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const errors = {};
      for (let field in err.errors) {
          errors[field] = err.errors[field].message;
      }
      return res.status(400).json({Status: false,message: 'Validation failed!',errors: errors});
    }
    return res.status(500).json({ Status: false, message: 'Internal Server Error' });
  }
};
//Add direct by User END

//Get my direct START
exports.getMyReferrals = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required in params.' });
    }

    const user = await users.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.referrals || user.referrals.length === 0) {
      return res.status(200).json({ success: true, message: 'No referrals found.', referredUsers: [] });
    }

    const referredUsers = await users.find({ _id: { $in: user.referrals } }).select('-password');

    res.status(200).json({
      success: true,
      count: referredUsers.length,
      referredUsers
    });
  } catch (err) {
    console.error('Error fetching referrals:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
//Get my direct END

//Add files START 
// flyers// ppt// agreement
exports.addFiles = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const flyersFiles = req.files['flyers'] || [];
    const pptFiles = req.files['ppt'] || [];
    const agreementFile = req.files['agreement'] ? req.files['agreement'][0] : null;

    // Try to find if a file document already exists for the user
    let existingFile = await fileModel.findOne({ user: userId });

    if (existingFile) {
      // If file document exists, update it
      if (flyersFiles.length > 0) {
        existingFile.flyers.push(...flyersFiles.map(file => file.filename));
      }
      if (pptFiles.length > 0) {
        existingFile.ppt.push(...pptFiles.map(file => file.filename));
      }
      if (agreementFile) {
        existingFile.agreement = agreementFile.filename;
      }

      const updatedFile = await existingFile.save();
      return res.status(200).json({ success: true, message: 'Files updated successfully', data: updatedFile });

    } else {
      // If no file document exists, create a new one
      const data = {
        user: userId,
        flyers: flyersFiles.map(file => file.filename),
        ppt: pptFiles.map(file => file.filename),
        agreement: agreementFile ? agreementFile.filename : "",
      };

      const createdFile = await fileModel.create(data);

      // Also push the file ID into user's `files` array
      await users.findByIdAndUpdate(
        userId,
        { $push: { files: createdFile._id } },
        { new: true }
      );

      return res.status(201).json({ success: true, message: 'Files uploaded successfully', data: createdFile });
    }

  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
//Add files END

//Read file START
exports.getFile = async (req, res) => {
  try {   
    // let { token } = req.userData;
    const dir = path.join(__dirname, '..', '..', 'pronet','UploadFiles');

    // Ensure the directory exists
    await fs.promises.mkdir(dir, { recursive: true });

    console.log('Directory:', dir);

    const filename = req.params.filename;

    // Read the files in the directory using fs.promises.readdir
    const filesInFolder = await fs.promises.readdir(dir);
    console.log('Files in directory:', filesInFolder);

    const filePath = path.join(dir, filename);

    // Log the full file path
    console.log('Full File Path:', filePath);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        // Determine the file extension
        const fileExtension = path.extname(filePath).toLowerCase();

        // Set content type based on file extension
        let contentType = 'application/octet-stream'; // Default content type
        if (fileExtension === '.pdf') {
            contentType = 'application/pdf';
        } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
            contentType = 'image/jpeg';
        } else if (fileExtension === '.xls' || fileExtension === '.xlsx') {
            contentType = 'application/vnd.ms-excel';
        } // Add more conditions for other file types if needed

        // Stream the file to the client
        const fileStream = fs.createReadStream(filePath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        fileStream.pipe(res);
    } else {
        res.status(404).json({ error: 'File not found' });
    }

  } catch (error) {
    console.error('Error downloading files:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
//Read file END


//Add Binary START
exports.addBinary = async (req, res) => {
  try {
    const { parentId, childId, position } = req.body;

    if (!parentId || !childId || !['left', 'right'].includes(position)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Check if child already placed
    const existingChild = await BinaryReferral.findOne({ user: childId });
    if (existingChild) {
      return res.status(400).json({ message: 'Child already placed in binary tree' });
    }

    // Ensure parent exists in tree
    let parentNode = await BinaryReferral.findOne({ user: parentId });
    if (!parentNode) {
      parentNode = await BinaryReferral.create({
        user: parentId,
        left: null,
        right: null,
        parent: null
      });
    }

    // Breadth-First Search to find next available node on the selected side
    const queue = [parentNode];
    let targetNode = null;

    while (queue.length > 0) {
      const current = queue.shift();
      const leftChild = await BinaryReferral.findOne({ user: current.left });
      const rightChild = await BinaryReferral.findOne({ user: current.right });

      if (position === 'left' && !current.left) {
        targetNode = current;
        break;
      }
      if (position === 'right' && !current.right) {
        targetNode = current;
        break;
      }

      // Enqueue children in selected direction first
      if (position === 'left') {
        if (leftChild) queue.push(leftChild);
        if (rightChild) queue.push(rightChild);
      } else {
        if (rightChild) queue.push(rightChild);
        if (leftChild) queue.push(leftChild);
      }
    }

    if (!targetNode) {
      return res.status(400).json({ message: 'No available position found on selected side.' });
    }

    // Create new node and update parent
    await BinaryReferral.create({
      user: childId,
      parent: targetNode.user
    });

    targetNode[position] = childId;
    await targetNode.save();

    return res.status(200).json({
      message: `User placed at ${position} of user ${targetNode.user}`
    });

  } catch (error) {
    console.error('Binary placement failed:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
//Add Binary END

//Get binary tree START
exports.getBinaryByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Helper: recursive function to build the tree
    const buildTree = async (user) => {
      if (!user) return null;

      const node = await BinaryReferral.findOne({ user });
      if (!node) return null;

      return {
        user: node.user,
        left: await buildTree(node.left),
        right: await buildTree(node.right)
      };
    };

    const tree = await buildTree(userId);

    if (!tree) {
      return res.status(404).json({ message: 'Binary tree not found for this user' });
    }

    res.status(200).json(tree);

  } catch (error) {
    console.error('Failed to fetch binary tree:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
//Get binary tree END

//Add ticket START
exports.raiseTicket = async (req, res) => {
  try {
    const { userId, subject, message, type } = req.body;

    if (!userId || !subject || !message || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newTicket = new Ticket({
      user: userId,
      subject,
      message,
      type
    });

    await newTicket.save();
    res.status(201).json({ message: 'Ticket raised successfully', ticket: newTicket });
  } catch (error) {
    console.error('Error raising ticket:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
//Add ticket END

//Get ticket of a user START
exports.getTicketsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const tickets = await Ticket.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Tickets fetched successfully',
      tickets
    });
  } catch (error) {
    console.error('Error fetching tickets by user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
//Get ticket of a user END

//Generate e-pin START
exports.generateEpin = async (req, res) => {
  try {
    const { numberOfEpins, value, senderUserId, senderType } = req.body;

    // Helper function defined inside the route handler
    function generateEpinCode() {
      return uuidv4().slice(0, 12).toUpperCase(); 
    }

    // Validate sender (can be either user or admin)
    let sender = null;
    if (senderType === 'usermaster') {
      sender = await users.findById(senderUserId);
    } else if (senderType === 'admin') {
      sender = await admins.findById(senderUserId);
    } else {
      return res.status(400).json({ message: 'Invalid sender type' });
    }

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Generate and store Epins
    const generatedEpins = [];

    for (let i = 0; i < numberOfEpins; i++) {
      const epinCode = generateEpinCode();

      const epin = new Epin({
        epin_codes: [epinCode],
        value,
        status: 'unused',
        generated_by: sender._id,
        sender: sender._id,
        senderType
      });

      await epin.save();
      generatedEpins.push(epinCode);
    }

    return res.status(200).json({
      message: `${numberOfEpins} Epin(s) generated successfully`,
      epins: generatedEpins
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}
//Generate e-pin END

//Transfer e-pin START
exports.transferEpin = async (req, res) => {
  try {
    const { epinCodes, senderUserId, senderType, receiverUserId } = req.body;

    // Validate sender
    let sender = null;
    if (senderType === 'usermaster') {
      sender = await users.findById(senderUserId);
    } else if (senderType === 'admin') {
      sender = await admins.findById(senderUserId);
    } else {
      return res.status(400).json({ message: 'Invalid sender type' });
    }

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Validate receiver
    const receiver = await users.findById(receiverUserId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Loop through each Epin code and transfer it
    for (let epinCode of epinCodes) {
      const epin = await Epin.findOne({ epin_codes: epinCode, status: 'unused' });

      if (!epin) {
        return res.status(404).json({ message: `Epin with code ${epinCode} not found or already used.` });
      }

      // Check if sender generated the Epin
      if (epin.generated_by.toString() !== senderUserId) {
        return res.status(403).json({ message: `You are not authorized to transfer Epin ${epinCode}.` });
      }

      // Update the Epin with sender and receiver details
      epin.sender = senderUserId;
      epin.senderType = senderType;
      epin.receiver = receiverUserId;

      // Optionally, mark the Epin as used and update used_by field
      epin.status = 'used';
      epin.used_by = receiverUserId;
      epin.used_at = new Date();

      // Save the updated Epin
      await epin.save();
    }

    return res.status(200).json({ message: 'Epins transferred successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
//Transfer e-pin END