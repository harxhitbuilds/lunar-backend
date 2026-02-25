import express from "express";
import {
  addSong,
  deleteSong,
  addAlbum,
  deleteAlbum,
  addPlaylist, deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  addSongToAlbum,
  removeSongFromAlbum
} from "../controllers/admin.controller.js";
import { uploadMedia } from "../middlewares/multer.js";
import { protectedRoute, adminOnly } from "../middlewares/auth.middleware.js";
const adminRouter = express.Router();

adminRouter.use(protectedRoute);
adminRouter.use(adminOnly);

adminRouter.post(
  "/add-song",
  uploadMedia.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "audioFile",
      maxCount: 1,
    },
  ]),
  addSong
);

adminRouter.delete("/delete-song/:id", deleteSong);

adminRouter.post("/add-album", uploadMedia.single("coverImage"), addAlbum);

adminRouter.delete("/delete-album/:id", deleteAlbum);

adminRouter.post(
  "/add-playlist",
  uploadMedia.single("coverImage"),
  addPlaylist
);

adminRouter.delete("/delete-playlist/:id", deletePlaylist);

adminRouter.post("/add-song-to-playlist/:playlistId/:songId", addSongToPlaylist);

adminRouter.delete("/remove-song-from-playlist/:playlistId/:songId", removeSongFromPlaylist);

adminRouter.post("/add-song-to-album/:albumId/:songId", addSongToAlbum);
adminRouter.delete("/remove-song-from-album/:albumId/:songId", removeSongFromAlbum);

export default adminRouter;
