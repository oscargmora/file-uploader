import { Router } from "express";
import homepageController from "../controllers/homepageController.js";

const homepageRouter = Router();

homepageRouter.get("/:id", homepageController.homepageGet);
homepageRouter.post("/upload-file/:id?", homepageController.homepageUploadFilePost);
homepageRouter.post("/create-folder/:id?", homepageController.homepageCreateFolderPost);
homepageRouter.get("/delete-folder/:id?", homepageController.homepageDeleteFolderGet);
homepageRouter.post("/delete-folder/:id?", homepageController.homepageDeleteFolderPost);
homepageRouter.post("/rename-folder/:id?", homepageController.homepageRenameFolderPost);
homepageRouter.post("/:folderId/rename-file/:fileId", homepageController.homepageRenameFilePost);
homepageRouter.get("/:folderId/delete-file/:fileId", homepageController.homepageDeleteFileGet);
homepageRouter.post("/:folderId/delete-file/:fileId", homepageController.homepageDeleteFilePost);

export default homepageRouter;
