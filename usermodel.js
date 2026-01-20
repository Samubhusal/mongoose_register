// const mongoose=require ("mongoose");
// mongoose.connect('mongodb://localhost:27017/mongobdPractise');

// const userSchema=mongoose.Schema({
//     name:String,
//     email:String,
//     nickname:String,
//     password:String,
// });

// module.exports=mongoose.model("user",userSchema);


const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/loginsignupDB");

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  email: String,
  password: String, // ahile simple rakheko (no hashing)
});

module.exports = mongoose.model("User", userSchema);