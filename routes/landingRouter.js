import { Router } from "express";
import landingGet from "../controllers/landingController.js";

const landingRouter = Router();

landingRouter.get("/", landingGet);

export default landingRouter;
