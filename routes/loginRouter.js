import { Router } from "express";
import loginController from "../controllers/loginController.js";

const loginRouter = Router();

loginRouter.get("/", loginController.loginGet);
loginRouter.post("/", loginController.loginPost);
loginRouter.get("/logout", loginController.logout);

export default loginRouter;
