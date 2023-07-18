import "dotenv/config";
import express from "express";
import cors from "cors";
import tl_payment from "./routes/tl_payment.js";
import tl_webhooks from "./routes/tl_webhooks.js";

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(cors());

app.use("/pay", tl_payment);
app.use("/notifications", tl_webhooks);

app.get("/", (req, res) => {
  res.json("P2P Payments");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
