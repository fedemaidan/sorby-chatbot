const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const flowSchema = new mongoose.Schema(
  {
    // En Sequelize usabas UUID como PK. En Mongoose podrías usar ObjectId,
    // pero si querés mantener compat, guardamos un id tipo UUID string.
    id: {
      type: String,
      default: uuidv4,
      index: true,
      unique: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    flowData: {
      // JSON en Sequelize -> Mixed en Mongoose (o Schema.Types.Map si preferís)
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    flow: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    step: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,        // createdAt / updatedAt como en Sequelize
    versionKey: false,       // desactiva __v
  }
);

// Índice compuesto para asegurar 1 flow por usuario/tipo de flow:
flowSchema.index({ userId: 1, flow: 1 }, { unique: true });

// Si preferís usar _id como UUID en vez de "id" separado, podés:
// flowSchema.add({ _id: { type: String, default: uuidv4 } });
// y en el model: mongoose.model("Flow", flowSchema, "flows"); (opcional)

const Flow = mongoose.model("Flow", flowSchema);
module.exports = Flow;