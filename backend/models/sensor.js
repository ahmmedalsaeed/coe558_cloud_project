const mongoose =require ('mongoose');
 
  // Define Sensor Schema
const sensorSchema = new mongoose.Schema({
    sensorId: { type: Number, required: true, unique: true },
    sensorName: { type: String, required: true },
    sensorType: { type: String, required: true },
    data: [{type:mongoose.Schema.Types.ObjectId,ref:"Data"}],
    zoneId_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone'},
    zoneId:{type: Number ,required:true},
  });
const Sensor = mongoose.model('Sensor', sensorSchema);
module.exports = Sensor;