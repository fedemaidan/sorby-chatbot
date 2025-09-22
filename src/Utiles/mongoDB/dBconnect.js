const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  console.log("Connecting to MongoDB");
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // opciones opcionales modernas
      // no hacen falta en Mongoose >=7, lo dejo por claridad:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      autoIndex: true, // activa creación de índices (útil en dev)
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectToMongoDB;