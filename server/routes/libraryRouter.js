import express from "express";
import {
  getImages,
  deleteImage,
  getFolders,
} from "../../models/libraryModel.js";
import { isAuthed } from "../../middlewares/authMiddleware.js";
import { uploadImage } from "../../middlewares/uploadMiddleware.js";

const router = express.Router();

const page = (page) => ({
  title: "Tama-cms - Library",
  path: "pages/library/" + page,
  current: "library",
});

router.get("/library", isAuthed, (req, res) => {
  const { path = "/" } = req.query;

  const images = getImages(path);
  const folders = getFolders(path);

  res.render("document", {
    page: page("index"),
    props: {
      authed: true,
      csrf: req.csrfToken(),
      images,
      folders,
      path: path.replace("/", "").split("/"),
    },
  });
});

router.get("/library/add", isAuthed, (req, res) => {
  res.render("document", {
    page: page("add"),
    props: {
      authed: true,
      csrf: req.csrfToken(),
    },
  });
});

router.get("/library/modify/:image", isAuthed, (req, res) => {
  res.render("document", {
    page: page("modify"),
    props: {
      authed: true,
      csrf: req.csrfToken(),
    },
  });
});

//
//
//
//
//

router.post("/library", isAuthed, (req, res) => {
  uploadImage(req, res, (err) => {
    if (err) {
      return res.sendStatus(403);
    }

    res.redirect("/library");
  });
});

router.put("/library", isAuthed, (req, res) => {
  uploadImage(req, res, (err) => {
    if (err) {
      console.log(err, req.file);
      return res.sendStatus(403);
    }

    res.redirect("/library");
  });
});

router.delete("/library", isAuthed, (req, res) => {
  const { image_id } = req.body;

  if (!image_id) return res.sendStatus(403);

  let result = deleteImage(image_id);

  if (result) return res.sendStatus(200);

  res.sendStatus(403);
});

export default router;
