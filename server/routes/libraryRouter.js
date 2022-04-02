import express from "express";
import { getImages, deleteImage } from "../../controllers/libraryController.js";
import { isAuthed } from "../../middlewares/authMiddleware.js";
import { uploadImage } from "../../middlewares/uploadMiddleware.js";

const router = express.Router();

const page = {
  title: "Tama-cms - Library",
  path: "pages/library",
  current: "library",
};

router.get("/library", isAuthed, (req, res) => {
  const images = getImages();

  res.render("document", {
    page,
    props: {
      authed: true,
      csrf: req.csrfToken(),
      images,
    },
  });
});

router.post("/library", isAuthed, (req, res) => {
  uploadImage(req, res, (err) => {
    if (err) {
      return res.sendStatus(403);
    }

    res.redirect("/library");
  });
});

router.delete("/library", isAuthed, (req, res) => {
  const { image } = req.body;

  if (!image) return res.sendStatus(403);

  let result = deleteImage(image);

  if (result) return res.sendStatus(200);

  res.sendStatus(403);
});

export default router;
