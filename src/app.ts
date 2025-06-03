import cors from "cors";
import express from "express";
import contactRoutes from "./routes/contact.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", contactRoutes);

export default app;
