import express from "express";
import { isAuthed } from "../../middlewares/authMiddleware.js";
import imageController from "../../controller/imageController.js";
import folderController from "../../controller/folderController.js";
import libraryController from "../../controller/libraryController.js";

const router = express.Router();

const page = (page) => ({
  title: "Tama-cms - Library",
  path: "pages/library/" + page,
  current: "library",
});

router.get("/library", isAuthed, (req, res) => {
  const { path = "/" } = req.query;

  libraryController.getView({ path }, req, res);
});

router.get("/library/modify/folder", isAuthed, (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.render("document", {
      page: page("error"),
      props: { authed: true, error: "Folder not found" },
    });
  }

  folderController.modifyView({ id }, req, res);
});

router.get("/library/modify/image", isAuthed, (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.render("document", {
      page: page("error"),
      props: { authed: true, error: "Folder not found" },
    });
  }

  imageController.modifyView({ id }, req, res);
});

router.get("/library/add/folder", isAuthed, (req, res) => {
  const { path = "" } = req.query;

  folderController.addView({ path }, req, res);
});

router.get("/library/add/image", isAuthed, (req, res) => {
  const { path = "" } = req.query;

  imageController.addView({ path }, req, res);
});

//
//  API
//

router.put("/library/folder", isAuthed, (req, res) => {
  const { name, move, id } = req.body;
  if (!name || !move || !id) {
    return res.status(400).json({ error: "Please complete all fields" });
  }

  folderController.modify({ name, move, id }, res);
});

router.post("/library/folder", isAuthed, (req, res) => {
  const { name, path } = req.body;

  if (!name || !path) {
    return res.status(400).json({ error: "Please complete all fields" });
  }

  folderController.add({ name, path }, res);
});

router.delete("/library/folder", isAuthed, (req, res) => {
  const { id } = req.body;
  if (!id) return res.sendStatus(403);

  folderController.delete({ id }, res);
});

router.post("/library/image", isAuthed, (req, res) => {
  const { path } = req.query;
  if (!path) return res.sendStatus(403);

  imageController.add({ path }, req, res);
});

router.put("/library/image", isAuthed, (req, res) => {
  const { name, id, move } = req.body;
  if (!name || !id || !move) {
    return res.status(400).json({ error: "Please complete all fields" });
  }

  imageController.modify({ name, id, move }, res);
});

router.put("/library/image/crop", isAuthed, (req, res) => {
  imageController.crop(req, res);
});

router.delete("/library/image", isAuthed, (req, res) => {
  const { id } = req.body;
  if (!id) return res.sendStatus(403);

  imageController.delete({ id }, res);
});

export default router;
