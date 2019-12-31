const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driverSchema = new Schema({
    name:String,
    phoneNum:String,
    address:String,
    age:Number,
    licenseNo:String
})

const Driver = mongoose.model("Driver",driverSchema);

module.exports = Driver;