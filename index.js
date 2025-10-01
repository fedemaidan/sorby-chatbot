require('dotenv/config');
const PORT = process.env.PORT || 3010;
const connectToMongoDB = require("./src/Utiles/mongoDB/dBconnect");
const {connectToWhatsApp, router: whatsappRouter,} = require("./src/Utiles/Mensajes/whatsapp");
const express = require("express");
const cors = require('cors');
const indexRoutes = require("./src/routes/index.routes");

const startBot = async () => {
    const sock = await connectToWhatsApp();
    setInterval(() => console.log('Keep-alive'), 5 * 60 * 1000);
};

const startApi = async () => {
  const app = express();
  app.use(
    cors({
      origin: [
        "http://localhost:3002",
        "http://localhost:3000",
        "http://localhost:4000",
        "http://127.0.0.1:3000",
        "http://137.184.68.197:3004",
        "https://sorbydata.com",
        //"https://admin.sorbydata.com",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
  app.use(express.json());

  app.use("/api", indexRoutes);
  app.use("/api/whatsapp", whatsappRouter);
  app.get("/", (req, res) => {
    res.json({ message: "API Bot Fundas funcionando correctamente" });
  });

  app.listen(PORT, async () => {
    await connectToMongoDB();
    console.log(`API running on port ${PORT}`);
  });
};

startApi();
startBot();
