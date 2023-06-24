const mongoose = require("mongoose");


mongoose.connect("mongodb+srv://admin-mansour:Mansour1372001@cluster0.sqscyxb.mongodb.net/QrCode", { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });
const Qrcode_Schema = mongoose.Schema({
    name:String,
    links:[
        {
            socialName:String,
            link:String,
        }
    ],
    qrcodeImg: String ,
    num_links:Number,
})
Qrcode_Schema.statics.createUser = function(userData) {
    return this.create(userData);
};


const User = mongoose.model('User' , Qrcode_Schema)

const findOrCreate = async (name)=>{
    try {
        let user = await User.findOne({ name:name });
        if (!user) {
            user = await User.createUser({ name });
        }
        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = {
    findOrCreate,
    User
}