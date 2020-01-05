const express = require("express");
const router = express.Router();
const Truck = require("../models/truck");
const Driver = require("../models/driver");
const Product = require("../models/product");
const net = require("net");
const accountSid = 'ACb59d6f868331e66e0e399026006ecde3';
const authToken = 'a2d3dfc034ddf86fbdb9937546b3ab61';
const phone = require('twilio')(accountSid, authToken);
const moment = require("moment");


const missSms = (name,to,lat,long)=>{
    const now = moment().format("LLLL");
    const message = `
Missing!!!
Product ${name} travelling on Truck1 to ${to} went missing on ${now}
Last Seen:
Latitude:${lat}
Longitude:${long} 
url:http://192.168.1.12:5000/admin/product/xxxyyzzz
    `;
    phone.messages
    .create({body: message, from: '+16466811616', to: "+918270132979"})
    .then(message => console.log(message.sid));
}

const foundSms = (name,to,lat,long)=>{
    const now = moment().format("LLLL");
    const message = `
Found!!!
Product ${name} travelling on Truck1 to ${to} found on ${now}
Found at:
Latitude:${lat}
Longitude:${long} 
url:http://192.168.1.12:5000/admin/product/xxxyyzzz
    `;
    phone.messages
    .create({body: message, from: '+16466811616', to: "+918270132979"})
    .then(message => console.log(message.sid));
}

let worker = null;


const checker = async ()=>{
    const truck = await Truck.findOne({name:"Truck1"}).populate("product").populate("driver").exec();
    const client = new net.Socket();
    client.connect({port:4444,host:"writer4.local"});
    client.on("error",()=>{});
    client.on("data",async (data)=>{
        const uid = data.toString().trim();
        if(uid === "FAILED" && truck.product.status === "On Way"){
            truck.product.status = "missing";
            await truck.product.save();
            global.io.emit("new",[truck])
            missSms(truck.product.name,truck.product.to,truck.cords[0],truck.cords[1]);
        }else if(uid !== "FAILED" &&  truck.product.tag === uid && truck.product.status === "missing"){
            truck.product.status = "On Way";
            await truck.product.save();
            global.io.emit("new",[truck]);
            foundSms(truck.product.name,truck.product.to,truck.cords[0],truck.cords[1]);
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
            const updatedTruck = await Truck.findOne({name:"Truck1"}).populate("product").exec();
            worker = setInterval(checker,3000);
            global.io.emit("new",[updatedTruck]);
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
            global.io.emit("new",[]);
            }
            truck.status = req.body.status;
            await truck.save();
            res.json();
        })

    }
    else if(req.body.status === "arrived"){
        Truck.findOne({name:"Truck1"}).populate("product").then(async (truck)=>{
            clearInterval(worker);
            truck.product.status = "delivered";
            truck.product.tag  = null;
            truck.product.arrivalDate = moment().format("MM/DD/YYYY");
            await truck.product.save()
            truck.status = "idle";
            truck.product = null;
            await truck.save();
            global.io.emit("new",[]);
            res.json();
        })
    }
    else res.status(400).json();
})


module.exports = router;


