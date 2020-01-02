const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const productRoute = require("./routes/product");
const truckRoute = require("./routes/truck");
const server =  require("http").Server(app);
const io = require("socket.io")(server);

global.io = io;

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


server.listen(PORT,()=>console.log(`Started server on port ${PORT}`));

io.on("connection",(socket)=>{
    console.log("new connection");
    socket.on("disconnect",()=>console.log("disconnected"));
})

