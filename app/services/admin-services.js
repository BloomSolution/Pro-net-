const admins = require('../admin/admin-model');

class adminServie {

//Find a particuler admin account by email START
    async adminFindAccount(email) {
        try {
        const data = await admins.findOne({ email: email })
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

// Create admin account SRART
 async adminCreateAccount(data) {
    try {
    return await admins.create(data)
    } catch (err) {
    console.log('create service ', err);
    throw err
    }
}
//Create admin account END

//Read all admin information START
async getAllAdminDetails() {
    try {
    const result = await admins.find()
                              .sort({ createdAt: -1 })
                             // .populate('referrals') 
                           
    return { Status: true, data: result }
    } catch (err) {
    console.log('Get all admin details service err', err);
    throw new Error()
    }
  }
  //Read all admin information END

//Read a admin information END
async findAndGetAdminAccount(admin_id) {
    try {
     
      let admin = await admins.findById(admin_id).lean();
      if (!admin) return { Status: false, message: "Admin not found" };
    
      return { Status: true, data: admin };
  
  } catch (err) {
      console.log('Get admin account service error:', err);
      throw new Error(err);
  }
  }
//Read a admin information END

 //Update admin info SRART
 async updateAdminInfo(id,data) {
    try {
        let result = await admins.findByIdAndUpdate(id,{$set:data},{new:true})
        return {Status:true,result}
    } catch (err) {
        console.log('Update admin service ', err);
    throw err
    }
}
//Update admin info END

//find and delete admin account START
async findAndDeleteAdminAccount(id) {
    try {
    return await admins.findByIdAndDelete(id, { $set: { active: false } }, { new: true })
    } catch (err) {
    throw err
    }
}
//find and delete admin account END

}
module.exports = new adminServie();