import "dotenv/config";
import express from "express";
import landingRouter from "./routes/landingRouter.js";
import signupRouter from "./routes/signupRouter.js";
import loginRouter from "./routes/loginRouter.js";
import homepageRouter from "./routes/homepageRouter.js";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import passport from "passport";

const app = express();

app.set("view engine", "pug");

app.use(
	expressSession({
		cookie: {
			maxAge: 7 * 24 * 60 * 60 * 1000, // ms
		},
		secret: "a santa at nasa",
		resave: true,
		saveUninitialized: true,
		store: new PrismaSessionStore(new PrismaClient(), {
			checkPeriod: 2 * 60 * 1000, //ms
			dbRecordIdIsSessionId: true,
			dbRecordIdFunction: undefined,
		}),
	})
);

app.use(passport.session());

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

app.use(express.urlencoded({ extended: true }));

app.use("/", landingRouter);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/homepage", homepageRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT);
