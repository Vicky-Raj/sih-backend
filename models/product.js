const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    tag:String,
    name:String,
    from:String,
    to:String,
    fromCord:[Number],
    toCord:[Number],
    status:String,
    depDate:String,
    arrivalDate:String,
})

const Product = mongoose.model("Product",productSchema);

module.exports = Product;