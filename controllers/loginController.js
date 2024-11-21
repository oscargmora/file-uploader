import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy } from "passport-local";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: id,
			},
		});

		done(null, user);
	} catch (err) {
		done(err);
	}
});

passport.use(
	new Strategy(
		{
			usernameField: "email",
		},
		async (email, password, done) => {
			try {
				const user = await prisma.user.findUnique({
					where: {
						email: email,
					},
				});

				if (!user) {
					return done(null, false, { message: "Email Not Found" });
				}

				const match = await bcrypt.compare(password, user.password);

				if (!match) {
					return done(null, false, { message: "Incorrect Password" });
				}

				return done(null, user);
			} catch (err) {
				return done(err);
			}
		}
	)
);

async function loginGet(req, res) {
	res.render("login", {
		title: "MoraDrive",
	});
}

const loginPost = [
	expressAsyncHandler(async (req, res, next) => {
		passport.authenticate("local", (err, user, info) => {
			if (err) {
				return next(err);
			}

			if (!user) {
				return res.status(400).render("login", {
					errors: { authentication: [info.message] },
					inputs: req.body,
				});
			}

			req.login(user, (err) => {
				if (err) {
					return next(err);
				}
				return res.redirect("/homepage/1");
			});
		})(req, res, next);
	}),
];

const logout = [
	expressAsyncHandler(async (req, res, next) => {
		req.logout((err) => {
			return next(err);
		});
		res.redirect("/");
	}),
];

export default { loginGet, loginPost, logout };
