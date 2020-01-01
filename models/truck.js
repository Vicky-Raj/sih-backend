const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const truckSchema = new Schema({
    name:String,
    reg:String,
    cords:[Number],
    status:String,
    driver:{type:Schema.Types.ObjectId,ref:"Driver"},
    product:{type:Schema.Types.ObjectId,ref:"Product"}
})

const Truck = mongoose.model("Truck",truckSchema);

module.exports = Truck;