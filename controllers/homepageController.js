import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { body, validationResult } from "express-validator";
import expressAsyncHandler from "express-async-handler";

const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

const validation = body("folder")
	.trim()
	.isAlphanumeric()
	.withMessage("Folder name can only be alphanumeric");

const fileValidation = body("file")
	.trim()
	.isAlphanumeric()
	.withMessage("File name can only be alphanumeric");

async function homepageGet(req, res) {
	const user = await prisma.user.findUnique({
		where: {
			id: req.session.passport.user,
		},
		include: {
			folders: true,
		},
	});

	let folder;

	if (req.params.id === undefined) {
		const homepageFolder = user.folders[0];
		folder = await prisma.folder.findFirst({
			where: {
				id: parseInt(homepageFolder.id),
			},
			include: {
				parent: true,
				children: true,
				files: true,
			},
		});
	} else {
		folder = await prisma.folder.findFirst({
			where: {
				id: parseInt(req.params.id),
			},
			include: {
				parent: true,
				children: true,
				files: true,
			},
		});
	}

	if (!folder) {
		return res.status(404).render("error", {
			title: "Folder Not Found",
			message: "The folder you're looking for doesn't exist.",
		});
	}

	res.render("homepage", {
		title: "File Uploader",
		firstName: user.firstName,
		folder: folder,
	});
}

const homepageCreateFolderPost = [
	validation,
	expressAsyncHandler(async (req, res, next) => {
		const parentId = parseInt(req.params.id);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const user = await prisma.user.findUnique({
				where: {
					id: req.session.passport.user,
				},
				include: {
					folders: true,
				},
			});

			const folder = await prisma.folder.findFirst({
				where: {
					id: parentId,
				},
				include: {
					parent: true,
					children: true,
				},
			});

			return res.status(400).render("homepage", {
				title: "File Uploader",
				firstName: user.firstName,
				errors: errors.array(),
				inputs: req.body,
				folder: folder,
			});
		}

		try {
			await prisma.folder.create({
				data: {
					name: req.body.folder,
					parent: {
						connect: { id: parentId },
					},
					user: {
						connect: { id: req.session.passport.user },
					},
				},
			});
			const newFolder = await prisma.folder.findFirst({
				where: {
					name: req.body.folder,
				},
			});
			res.redirect(`/homepage/${newFolder.id}`);
		} catch (err) {
			return next(err);
		}
	}),
];

const homepageRenameFolderPost = [
	validation,
	expressAsyncHandler(async (req, res, next) => {
		const id = parseInt(req.params.id);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const user = await prisma.user.findUnique({
				where: {
					id: req.session.passport.user,
				},
				include: {
					folders: true,
				},
			});

			const folder = await prisma.folder.findFirst({
				where: {
					id: id,
				},
				include: {
					parent: true,
					children: true,
				},
			});

			return res.status(400).render("homepage", {
				title: "File Uploader",
				firstName: user.firstName,
				errors: errors.array(),
				inputs: req.body,
				folder: folder,
			});
		}

		try {
			await prisma.folder.update({
				where: {
					id: id,
				},
				data: {
					name: req.body.folder,
				},
			});
			res.redirect(`/homepage/${id}`);
		} catch (err) {
			return next(err);
		}
	}),
];

async function homepageDeleteFolderGet(req, res) {
	const folder = await prisma.folder.findFirst({
		where: {
			id: parseInt(req.params.id),
		},
		include: {
			parent: true,
			children: true,
		},
	});

	res.render("deleteFolder", {
		title: "File Uploader",
		folder: folder,
	});
}

async function homepageDeleteFolderPost(req, res) {
	const folder = await prisma.folder.findFirst({
		where: {
			id: parseInt(req.params.id),
		},
		include: {
			parent: true,
			files: true,
		},
	});

	const parent = folder.parent.id;

	if (folder.files) {
		folder.files.forEach(async (file) => {
			try {
				await cloudinary.uploader.destroy(file.id, { resource_type: "raw" });
			} catch (err) {
				console.error(err);
			}
		});
	}

	await prisma.folder.delete({
		where: {
			id: folder.id,
		},
	});

	res.redirect(`/homepage/${parent}`);
}

const homepageUploadFilePost = [
	upload.single("file"),

	expressAsyncHandler(async (req, res, next) => {
		if (!req.file) {
			return res.redirect(`/homepage/${id}`);
		}

		const id = parseInt(req.params.id);
		const file = req.file;

		try {
			const uploadResult = await new Promise((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{
						resource_type: "raw",
					},
					(err, result) => {
						if (err) reject(err);
						else resolve(result);
					}
				);
				uploadStream.end(req.file.buffer);
			});

			const folder = await prisma.folder.findFirst({
				where: {
					id: parseInt(req.params.id),
				},
				include: {
					parent: true,
					children: true,
				},
			});

			await prisma.file.create({
				data: {
					id: uploadResult.public_id,
					name: file.originalname,
					bytes: file.size,
					mimeType: file.mimetype,
					url: uploadResult.secure_url,
					folder: {
						connect: { id: folder.id },
					},
				},
			});
		} catch (err) {
			return next(err);
		}

		res.redirect(`/homepage/${id}`);
	}),
];

const homepageRenameFilePost = [
	fileValidation,
	expressAsyncHandler(async (req, res, next) => {
		const folderId = parseInt(req.params.folderId);
		const fileId = req.params.fileId;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const user = await prisma.user.findUnique({
				where: {
					id: req.session.passport.user,
				},
				include: {
					folders: true,
				},
			});

			const folder = await prisma.folder.findFirst({
				where: {
					id: folderId,
				},
				include: {
					parent: true,
					children: true,
					files: true,
				},
			});

			return res.status(400).render("homepage", {
				title: "File Uploader",
				firstName: user.firstName,
				errors: errors.array(),
				inputs: req.body,
				folder: folder,
			});
		}

		try {
			await prisma.file.update({
				where: {
					id: fileId,
				},
				data: {
					name: req.body.file,
				},
			});
			res.redirect(`/homepage/${folderId}`);
		} catch (err) {
			return next(err);
		}
	}),
];

async function homepageDeleteFileGet(req, res) {
	const folder = await prisma.folder.findFirst({
		where: {
			id: parseInt(req.params.folderId),
		},
		include: {
			files: true,
		},
	});

	const file = await prisma.file.findFirst({
		where: {
			folderId: parseInt(req.params.folderId),
			id: req.params.fileId,
		},
	});

	res.render("deleteFile", {
		title: "File Uploader",
		folder: folder,
		file: file,
	});
}

async function homepageDeleteFilePost(req, res) {
	const file = await prisma.file.findFirst({
		where: {
			id: req.params.fileId,
		},
	});

	const folderId = parseInt(req.params.folderId);

	const fileExtension = getFileExtension(file.mimeType);

	const fullPublicId = file.id + fileExtension;

	try {
		await cloudinary.uploader.destroy(file.id, { resource_type: "raw" });
	} catch (err) {
		console.error(err);
	}

	await prisma.file.delete({
		where: {
			id: file.id,
		},
	});

	res.redirect(`/homepage/${folderId}`);
}

async function homepageDeleteUserGet(req, res) {
	const folder = await prisma.folder.findFirst({
		where: {
			id: parseInt(req.params.id),
		},
		include: {
			parent: true,
			children: true,
		},
	});

	res.render("deleteUser", {
		title: "File Uploader",
		folder: folder,
	});
}

async function homepageUpdateUserGet(req, res) {
	const user = await prisma.user.findUnique({
		where: {
			id: req.session.passport.user,
		},
	});

	res.render("updateUser", {
		title: "MoraDrive",
		firstName: user.firstName,
		lastName: user.lastName,
	});
}

async function homepageUpdateUserPost(req, res) {
	await prisma.user.update({
		where: {
			id: req.session.passport.user,
		},
		data: {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
		},
	});
	res.redirect("/homepage");
}

async function homepageDeleteUserPost(req, res) {
	const user = await prisma.user.findUnique({
		where: {
			id: req.session.passport.user,
		},
		include: {
			folders: {
				include: {
					files: true,
				},
			},
		},
	});

	if (user.folders) {
		user.folders.forEach(async (folder) => {
			if (folder.files) {
				folder.files.forEach(async (file) => {
					try {
						await cloudinary.uploader.destroy(file.id, { resource_type: "raw" });
					} catch (err) {
						console.error(err);
					}
				});
			}
		});
	}

	req.session.destroy(async (err) => {
		if (err) {
			return next(err);
		}
	});

	await prisma.user.delete({
		where: {
			id: user.id,
		},
	});

	res.redirect("/");
}

export default {
	homepageGet,
	homepageCreateFolderPost,
	homepageRenameFolderPost,
	homepageDeleteFolderGet,
	homepageDeleteFolderPost,
	homepageUploadFilePost,
	homepageRenameFilePost,
	homepageDeleteFileGet,
	homepageDeleteFilePost,
	homepageUpdateUserGet,
	homepageUpdateUserPost,
	homepageDeleteUserGet,
	homepageDeleteUserPost,
};
