const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "FoodBridge backend is running!"
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "FoodBridge API is working!"
  });
});

app.listen(PORT, () => {
  console.log(`FoodBridge server running on port ${PORT}`);
});