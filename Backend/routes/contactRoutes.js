import express from "express";
import { createContactSubmission } from "../controllers/contact/createContactSubmission.Controller.js";

const router = express.Router();

router.post("/", createContactSubmission);

export default router;
