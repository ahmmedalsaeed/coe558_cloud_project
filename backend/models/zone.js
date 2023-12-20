const mongoose =require ('mongoose');
// Define Zone Schema
const zoneSchema = new mongoose.Schema({
    zoneId: { type: Number, required: true, unique: true },
    zoneName: { type: String, required: true },
    sensors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' }],
  });
const Zone = mongoose.model('Zone', zoneSchema);
module.exports = Zone;