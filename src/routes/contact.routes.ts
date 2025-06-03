import express from "express";
import { createContact } from "../controllers/contact.controller";

const router = express.Router();

router.post("/identify", createContact);

export default router;
