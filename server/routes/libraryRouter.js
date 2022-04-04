import express from "express";
import {
  getImagesOfPath,
  deleteImage,
  getFoldersOfPath,
  checkFolderExists,
  checkPathExists,
  getFolder,
  getMoveCandidates,
  modifyFolderName,
  checkMoveCandidate,
  moveFolder,
  generateFolderPath,
  createFolder,
  checkCreateFolder,
  deleteFolder,
  checkRenameFolder,
  getFolderOfPath,
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

  if (!checkPathExists(path)) {
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
    return res.render("document", {
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
      back: folder.path.replace("/", "").split("/").slice(0, -1).join("/"),
      folder,
      moveCandidates,
    },
  });
});

router.get("/library/add/folder", isAuthed, (req, res) => {
  const { path = "" } = req.query;

  if (!checkPathExists(path)) {
    return res.render("document", {
      page: page("error"),
      props: { authed: true, error: "Path does not exist" },
    });
  }

  res.render("document", {
    page: page("add/folder"),
    props: {
      authed: true,
      csrf: req.csrfToken(),
      back: path.replace("/", "").split("/").slice(0, -1).join("/"),
      path,
    },
  });
});

//
//  API
//

router.put("/library/folder", isAuthed, (req, res) => {
  const { name, move, id } = req.body;
  if (!name || !move || !id) {
    return res.status(400).json({ error: "Please complete all fields" });
  }

  if (!checkFolderExists(id)) return res.sendStatus(403);

  const folder = getFolder(id);

  // first rename
  if (folder.name !== name) {
    if (checkRenameFolder(id, name)) {
      modifyFolderName(id, name);
    } else {
      return res.status(400).json({ error: `"${name}" already exists` });
    }
  }

  // then move
  if (folder.parent_id !== parseInt(move)) {
    // folder moved
    if (checkMoveCandidate(id, move, name)) {
      moveFolder(id, move, name);
      generateFolderPath(id, move, name);
    } else {
      return res
        .status(400)
        .json({ error: `"${name}" already exists at chosen destination` });
    }
  } else {
    // folder not moved
    generateFolderPath(id, move, name);
  }

  res.sendStatus(200);
});

router.post("/library/folder", isAuthed, (req, res) => {
  const { name, path } = req.body;

  if (!name || !path) {
    return res.status(400).json({ error: "Please complete all fields" });
  }

  if (!checkPathExists(path)) return res.sendStatus(403);

  const parent = getFolderOfPath(path);

  if (checkCreateFolder(parent.id, name)) {
    createFolder(name, (path !== "/" ? path + "/" : "/") + name, parent.id);

    return res.sendStatus(200);
  } else {
    res.status(400).json({ error: `"${name}" already exists in destination` });
  }
});

router.delete("/library/folder", isAuthed, (req, res) => {
  const { id } = req.body;

  if (!id) return res.sendStatus(403);

  if (!checkFolderExists(id)) return res.sendStatus(403);

  deleteFolder(id);
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
