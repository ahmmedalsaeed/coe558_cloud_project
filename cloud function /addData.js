// cloud function to updata sensor data//
const mongoose = require('mongoose');
const functions = require('@google-cloud/functions-framework');


// Replace these values with your MongoDB connection details
const MONGODB_URI = 'mongodb+srv://coe558:kfupm@coe558.9j0xsua.mongodb.net/IoT?retryWrites=true&w=majority';

// Define Sensor Schema
const sensorSchema = new mongoose.Schema({
    sensorId: { type: Number, required: true, unique: true },
    sensorName: { type: String, required: true },
    sensorType: { type: String, required: true },
    data: [{type:mongoose.Schema.Types.ObjectId,ref:"Data"}],
    zoneId_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone'},
    zoneId:{type: Number ,required:true},
  });


// Define Data Schema
 const dataSchema = new mongoose.Schema({
    value: { type: Number, required: true }, 
    timestamp: { type: Date, default: Date.now() },
    sensorId: {type:Number},
    SensorId_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' },
  });
// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB database!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Create Zone and Sensor Models
const Sensor = mongoose.model('Sensor', sensorSchema);
const Data = mongoose.model('Data', dataSchema);

functions.http('addData', (req, res) => {
    const sensorId=req.body.sensorId;
    const value=req.body.value;
    const newdata=new Data({value:value,timestamp: new Date(),sensorId:sensorId});
    newdata.save()
    Sensor.findOne({sensorId:sensorId}).then(
    (sensor) => { 
      sensor.data.push(newdata._id);
      sensor.save();
      
    })

  .then(() =>res.status(201).json(newdata))
  .catch((error) => console.error('Error updating sensor data:', error));

});

