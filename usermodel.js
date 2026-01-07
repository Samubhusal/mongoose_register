const mongoose=require ("mongoose");
mongoose.connect('mongodb://localhost:27017/mongobdPractise');

const userSchema=mongoose.Schema({
    name:String,
    email:String,
    nickname:String,
    password:String,
});

module.exports=mongoose.model("user",userSchema);