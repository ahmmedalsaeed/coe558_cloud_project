const mongoose =require ('mongoose');
 // Define Data Schema
 const dataSchema = new mongoose.Schema({
    value: { type: Number, required: true }, // Define specific data point properties
    timestamp: { type: Date, default: Date.now() },
    sensorId: {type:Number},
    SensorId_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' },
  });
const Data = mongoose.model('Data', dataSchema);
// Export the Data model
module.exports = Data;
