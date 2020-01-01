const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const productRoute = require("./routes/product");
const truckRoute = require("./routes/truck");


const PORT = 5000;


mongoose.connect("mongodb://localhost/sih",{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
})

app.use(cors());
app.use(express.json());


app.use("/product",productRoute);
app.use("/truck",truckRoute);


app.listen(PORT,()=>console.log(`listening on port ${PORT}`))


