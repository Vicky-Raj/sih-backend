const express = require("express");
const router = express.Router();
const moment = require("moment");
const net = require("net");
const Product = require("../models/product");
const {from} = require("../constants");

router.post("/",(req,res)=>{
    if(!req.body.name || !req.body.to || !req.body.date)res.status(400).json();
    const client = new net.Socket();
    client.connect({port:4444,host:"writer4.local"})
    client.on("error",()=>res.status(400).json())
    client.on("data",(data)=>{
        const uid = data.toString().trim();
        if(uid === "FAILED")return res.status(400).json();
        const arrival = moment(req.body.date).format("DD/MM/YYYY");
        const today = moment().format("MM/DD/YYYY");
        const product = {
                tag:uid,
                name:req.body.name,
                from:from.name,
                to:req.body.to.name,
                fromCord:[from.lat,from.long],
                toCord:[req.body.to.lat,req.body.to.long],
                status:"loading",
                depDate:today,
                arrivalDate:arrival
            }
        Product.findOneAndUpdate({tag:uid},product,{new:true,upsert:true}).exec()
        .then((doc)=>{
            console.log(doc);
            res.json();
        })        
    })
})

module.exports = router;