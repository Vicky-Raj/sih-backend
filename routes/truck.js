const express = require("express");
const router = express.Router();
const Truck = require("../models/truck");
const Driver = require("../models/driver");

router.get("/",(req,res)=>{
    Truck.find({status:req.query.status}).populate("driver").then((trucks)=>{
        res.json(trucks);
    })
})

router.post("/",(req,res)=>{
    console.log(req.body);
    res.json()
})


module.exports = router;




