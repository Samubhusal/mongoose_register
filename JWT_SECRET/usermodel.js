const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/samikshyaDB");

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  email: String,
  password: String, 
});

module.exports = mongoose.model("User", userSchema);