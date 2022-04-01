import express from "express";
import { isAuthed } from "../../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const page = {
  title: "Tama-cms - Library",
  path: "pages/library",
  current: "library",
};

router.get("/library", isAuthed, (req, res) => {
  res.render("document", {
    page,
    props: {
      authed: true,
      csrf: req.csrfToken(),
    },
  });
});

router.post("/library", isAuthed, upload.single("upload_image"), (req, res) => {
  console.log(req.body);

  res.redirect("/library");
});

export default router;
