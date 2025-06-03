import { Request, Response } from "express";
import CustomException from "../helpers/customException";
import { createContact as createContactService } from "../services/contact.service";

export const createContact = async (req: Request, res: Response) => {
  try {
    const contact = await createContactService(req.body);
    res.status(201).json(contact);
  } catch (error) {
    console.error(error);
    if (error instanceof CustomException) {
      res.status(error.code).json({ error: error.message });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
