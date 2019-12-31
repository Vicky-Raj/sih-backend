const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name:String,
    from:String,
    to:String,
    fromCord:[Number],
    toCord:[Number],
    status:String,
    departureDate:Date,
    arrivalDate:Date,
})

const Product = mongoose.model("Product",productSchema);

module.exports = Product;