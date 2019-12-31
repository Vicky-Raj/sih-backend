const mongoose = require("mongoose");
const express = require("express");
const app = express();
const Truck = require("./models/truck");
const Driver = require("./models/driver");
const Product = require("./models/product");
const PORT = 5000;

mongoose.connect("mongodb://localhost/sih",{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
})


app.use(express.json());


app.listen(PORT,()=>console.log(`listening on port ${PORT}`))


