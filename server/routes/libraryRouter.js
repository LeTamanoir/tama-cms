import express from "express";
import {
  getImagesOfPath,
  deleteImage,
  getFoldersOfPath,
  checkFolderExists,
  checkPathExists,
  getFolder,
  getMoveCandidates,
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

  const folderExists = checkPathExists(path);

  if (!folderExists) {
    return res.render("document", {
      page: page("error"),
      props: { authed: true, error: "Folder not found" },
    });
  }

  const images = getImagesOfPath(path);
  const folders = getFoldersOfPath(path);

  res.render("document", {
    page: page("index"),
    props: {
      authed: true,
      images,
      folders,
      path: path.replace("/", "").split("/"),
    },
  });
});

router.get("/library/modify/folder", isAuthed, (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.render("document", {
      page: page("error"),
      props: { authed: true, error: "Folder not found" },
    });
  }

  if (!checkFolderExists(id)) {
    return res.render("document", {
      page: page("error"),
      props: { authed: true, error: "Folder not found" },
    });
  }

  const folder = getFolder(id);
  const moveCandidates = getMoveCandidates(id);

  res.render("document", {
    page: page("modify/folder"),
    props: {
      authed: true,
      csrf: req.csrfToken(),
      folder,
      moveCandidates,
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

//
//
//
//
//

router.post("/library/modify/folder", isAuthed, (req, res) => {
  const { name, move, id } = req.body;

  if (!name || !move || !id) return res.sendStatus(403);

  console.log(name, move, id);

  res.sendStatus(200);
});

// router.post("/library", isAuthed, (req, res) => {
//   uploadImage(req, res, (err) => {
//     if (err) {
//       return res.sendStatus(403);
//     }

//     res.redirect("/library");
//   });
// });

// router.put("/library", isAuthed, (req, res) => {
//   uploadImage(req, res, (err) => {
//     if (err) {
//       console.log(err, req.file);
//       return res.sendStatus(403);
//     }

//     res.redirect("/library");
//   });
// });

// router.delete("/library", isAuthed, (req, res) => {
//   const { image_id } = req.body;

//   if (!image_id) return res.sendStatus(403);

//   let result = deleteImage(image_id);

//   if (result) return res.sendStatus(200);

//   res.sendStatus(403);
// });

export default router;
