const mongoose =require ('mongoose');
const cors = require('cors');
const express = require('express');
const Data = require('./models/data');
const Zone=require('./models/zone');
const Sensor=require('./models/sensor');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

const MONGODB_URI =
  'mongodb+srv://coe558:kfupm@coe558.9j0xsua.mongodb.net/?retryWrites=true&w=majority';

const app = express();
app.use(cors());
app.use(bodyParser.json()); // to parse the body from POST requests

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB database!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// REST APIs
// Fetch All Records
app.get('/getzones', async (req, res) => { // GET /zone
    try{
        const data = await Zone.find({})
        res.send({status:"yes",data:data})
    }catch(err){
        res.status(400).json({ message: err.message });
    }
});

app.get('/getsensors', async (req, res) => { // GET /sensor
    try{
        const data = await Sensor.find({})
        res.send({status:"yes",data:data})
    }catch(err){
        res.status(400).json({ message: err.message });
    }
});

app.get('/getdata', async (req, res) => { // GET /data
    try{
        const data = await Data.find({})
        res.send({status:"yes",data:data})
    }catch(err){
        res.status(400).json({ message: err.message });
    }
});


// POST Records
app.post("/zone", async (req, res) => { // POST /zone
    try{
        const zoneId = req.body.zoneId;
        const zoneName = req.body.zoneName;
        const newZone = new Zone({ zoneId:zoneId, zoneName:zoneName });
        await newZone.save();
        // const newZoneId = newZone._id;
        // res it added 
        res.send(`zone with id ${newZone.zoneId} successfully  created`);
    }catch(err){
        res.status(400).json({ message: err.message });
    }
});

app.post("/sensor", async (req, res) => { // POST /sensor
    try{ 
        const sensorId = req.body.sensorId;
        const zoneId = req.body.zoneId;
        const sensorType = req.body.sensorType;
        const sensorName=req.body.sensorName;
        const newSensor = new Sensor({sensorId:sensorId,zoneId:zoneId,sensorType:sensorType,sensorName:sensorName });
        newSensor.save();
        Zone.findOne({zoneId:zoneId}).then(
            (Zone)=>{
                Zone.sensors.push(newSensor._id);
                Zone.save();
            
            })
        res.send(`Sensor ${newSensor.sensorId} successfully  created`)
    }catch(err){
        res.status(400).json({ message: err.message });
    }
});

app.post("/data", async (req, res) => { // POST /data
    try{
    const data=new Data({value:req.body.value,sensorId:req.body.sensorId})
    await data.save();
    res.status(201).json(data);
}catch(err){
    res.status(400).json({ message: err.message });
}});


// find specific sensor by id
app.post("/getsensor",async (req,res) =>{
    const sensorId=req.body.sensorId;
    Sensor.findOne({sensorId:sensorId}).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.json(err);
    })
})

app.post("/getzone",async (req,res) =>{
    try{
        const zoneId=req.body.zoneId;
        const zone=await Zone.findOne({zoneId:zoneId});
        if(!zone){
            throw new Error('Zone not found');
        }
        res.json(zone);

    }catch(err){
        res.status(400).json({ message: err.message });
    } 
})

// get data by timestamp to timestamp
app.post("/getdatabytime",async (req,res) =>{
    try{
        const from=req.body.from;
        const to=req.body.to;
        const data=await Data.find({timestamp:{$gte:from,$lte:to}});
        res.json(data);

    }catch(err){
        res.status(400).json({ message: err.message });
    } 
})

app.post("/getdatabyzone",async (req,res) =>{
    try{
        const zoneId=req.body.zoneId;
        const data=await Data.find({zoneId:zoneId});
        res.json(data);

    }catch(err){
        res.status(400).json({ message: err.message });
    } 
})

app.post("/getdatabysensor",async (req,res) =>{
    try{
        const sensorId=req.body.sensorId;
        const data=await Data.find({sensorId:sensorId});
        res.json(data);

    }catch(err){
        res.status(400).json({ message: err.message });
    } 
})

app.post("/getdatabytype",async (req,res) =>{
    try{
        const sensorType=req.body.sensorType;
        const data=await Data.find({sensorType:sensorType});
        res.json(data);

    }catch(err){
        res.status(400).json({ message: err.message });
    } 
})
// get sensor data by id using get

app.get('/getsensordata/:id', async (req, res) => {
    try {
        const sensorId = req.params.id;
        const data = await Data.find({sensorId:sensorId});
        if (!data) {
            throw new Error('data not found');
        }
        res.json(data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})
app.listen(PORT, () => {
    console.log("Server is running on port 5000");
})