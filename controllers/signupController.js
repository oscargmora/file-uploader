import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 20 characters";

const validation = [
	body("firstName")
		.trim()
		.isAlpha()
		.withMessage(`First Name ${alphaErr}`)
		.isLength({ min: 1, max: 20 })
		.withMessage(`First Name ${lengthErr}`),

	body("lastName")
		.trim()
		.isAlpha()
		.withMessage(`Last Name ${alphaErr}`)
		.isLength({ min: 1, max: 20 })
		.withMessage(`Last Name ${lengthErr}`),

	body("email").trim().isEmail().withMessage("Invalid email address."),

	body("password")
		.trim()
		.isLength({ min: 8, max: 255 })
		.withMessage("Password must be at least 8 characters long and a maximum of 255 characters long.")
		.matches(/\d/)
		.withMessage("Password must contain at least one number")
		.matches(/[!@#$%^&*(),.?":{}|<>]/)
		.withMessage("Password must contain at least one special character")
		.not()
		.isIn(["12345678", "123456789", "1234567890", "0123456789", "password", "qwerty"])
		.withMessage("Do not use a common password"),

	body("confirmPassword").custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error("Passwords do not match");
		}
		return true;
	}),
];

async function signupGet(req, res) {
	res.render("signup", {
		title: "MoraDrive",
	});
}

const signupPost = [
	validation,
	expressAsyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render("signup", {
				errors: errors.array(),
				inputs: req.body,
			});
		}

		bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
			if (err) {
				return next(err);
			}

			try {
				await prisma.user.create({
					data: {
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						email: req.body.email,
						password: hashedPassword,
						folders: {
							create: {
								name: "Home",
								bytes: 0,
							},
						},
					},
				});

				res.redirect("/login");
			} catch (err) {
				return next(err);
			}
		});
	}),
];

export default { signupGet, signupPost };
