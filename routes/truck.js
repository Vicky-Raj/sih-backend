const express = require("express");
const router = express.Router();
const Truck = require("../models/truck");
const Driver = require("../models/driver");
const Product = require("../models/product");
const net = require("net");



let worker = null;

const checker = async ()=>{
    const truck = await Truck.findOne({name:"Truck1"}).populate("product").exec();
    const client = new net.Socket();
    client.connect({port:4444,host:"writer4.local"});
    client.on("error",()=>{});
    client.on("data",async (data)=>{
        const uid = data.toString().trim();
        if(uid === "FAILED" && truck.product.status === "On Way"){
            truck.product.status = "missing";
            await truck.product.save();
            global.io.emit("new",[truck])
        }else if(uid !== "FAILED" && truck.product.status === "missing"){
            truck.product.status = "On Way";
            await truck.product.save();
            global.io.emit("new",[truck]);
        }
    })
}


Truck.findOne({name:"Truck1"}).then((truck)=>{
    if(truck.status === "travel")worker = setInterval(checker,2000);
})

router.get("/",(req,res)=>{
    Truck.find({status:req.query.status}).populate("driver").populate("product").then((trucks)=>{
        res.json(trucks);
    })
})

router.post("/",(req,res)=>{
    if(req.body.status === "travel"){
        const client = new net.Socket;
        client.connect({port:4444,host:"writer4.local"});
        client.on("error",()=>res.status(400).json());
        client.on("data",async (data)=>{
            const uid = data.toString().trim();
            if(uid === "FAILED") return res.status(400).json();
            const truck = await Truck.findOne({name:"Truck1"}).exec();
            const product = await Product.findOne({tag:uid}).exec();
            truck.status = req.body.status;
            product.status = "On Way";
            truck.product = product._id;
            await product.save();
            await truck.save();
            worker = setInterval(checker,3000);
            res.json();
        })        

    }else if(req.body.status === "loading"){
        Truck.findOne({name:"Truck1"}).then((truck)=>{
            truck.status = req.body.status;
            truck.save().then(()=>res.json())
    })

    }else if(req.body.status ===  "idle"){
        Truck.findOne({name:"Truck1"}).populate("product").then(async (truck)=>{
            if(truck.status === "travel"){
            truck.product.status = "loading";
            await truck.product.save();
            truck.product = null;
            clearInterval(worker);

            }
            truck.status = req.body.status;
            await truck.save();
            res.json();
        })

    }
    else res.status(400).json();
})


module.exports = router;


