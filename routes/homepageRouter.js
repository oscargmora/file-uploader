import { Router } from "express";
import homepageController from "../controllers/homepageController.js";

const homepageRouter = Router();

homepageRouter.get("/:id?", homepageController.homepageGet);
homepageRouter.post("/create-folder/:id?", homepageController.homepageCreateFolderPost);
homepageRouter.post("/rename-folder/:id?", homepageController.homepageRenameFolderPost);
homepageRouter.get("/delete-folder/:id?", homepageController.homepageDeleteFolderGet);
homepageRouter.post("/delete-folder/:id?", homepageController.homepageDeleteFolderPost);
homepageRouter.post("/upload-file/:id?", homepageController.homepageUploadFilePost);
homepageRouter.post("/:folderId/rename-file/:fileId", homepageController.homepageRenameFilePost);
homepageRouter.get("/:folderId/delete-file/:fileId", homepageController.homepageDeleteFileGet);
homepageRouter.post("/:folderId/delete-file/:fileId", homepageController.homepageDeleteFilePost);
homepageRouter.get("/update-user/:id?", homepageController.homepageUpdateUserGet);
homepageRouter.post("/update-user/:id?", homepageController.homepageUpdateUserPost);
homepageRouter.get("/delete-user/:id?", homepageController.homepageDeleteUserGet);
homepageRouter.post("/delete-user/:id?", homepageController.homepageDeleteUserPost);

export default homepageRouter;
