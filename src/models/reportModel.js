import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true }, // Referencia al usuario que realiza el reporte
    //añadir identificador de itinerario y publicacion
    type: { 
      type: String, 
      enum: ['publication', 'itinerary'], // Tipos permitidos: "publication" o "itinerary"
      required: true 
    },
    resourceId: { 
      type: String, 
      required: true,  // Siempre es necesario
      refPath: 'type', // Aquí indicamos que la referencia dependerá del campo `type`
    },
    reason: { type: String, required: true }, // Razón del reporte
  }, {
    timestamps: true, // Añade automáticamente createdAt y updatedAt
});


const Report = mongoose.model('Report', reportSchema);

export default {
  Report
};