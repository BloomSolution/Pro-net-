const users = require('../user/user-model');

class userServie {

//Find a particuler user account by email START
    async findAccount(email) {
        try {
        const data = await users.findOne({ email: email })
                                .populate({ 
                                    path: 'tokens', 
                                    select: '-createdAt -updatedAt -user_id -__v -_id' 
                                })
            if (data) {
                return data;
            }
            else {
                return false;
            }
        } catch (err) {
        console.log('service error', err);
        throw err
        }
    }       
//Find a particuler user account by email END  

// Create user account SRART
 async createAccount(data) {
    try {
    return await users.create(data)
    } catch (err) {
    console.log('create service ', err);
    throw err
    }
}
//Create user account END

//Read all users information START
async getAllUserDetails() {
    try {
    const result = await users.find()
                              .sort({ createdAt: -1 })
                             // .populate('referrals') 
                           
    return { Status: true, data: result }
    } catch (err) {
    console.log('Get task service err', err);
    throw new Error()
    }
}
//Read all users information END

//Read a user information END
async findAndGetUserAccount(user_id) {
    try {
     
      let user = await users.findById(user_id).lean();
      if (!user) return { Status: false, message: "User not found" };
    
      return { Status: true, data: user };
  
  } catch (err) {
      console.log('Get user account service error:', err);
      throw new Error(err);
  }
}
//Read a user information END

 //Update user info SRART
 async updateUserInfo(id,data) {
    try {
        let result = await users.findByIdAndUpdate(id,{$set:data},{new:true})
        return {Status:true,result}
    } catch (err) {
        console.log('Update admin service ', err);
    throw err
    }
}
//Update user info END

//find and delete user account START
async findAndDeleteUserAccount(id) {
    try {
    return await users.findByIdAndDelete(id, { $set: { active: false } }, { new: true })
    } catch (err) {
    throw err
    }
}
//find and delete user account END

}
module.exports = new userServie();