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
  checkMoveFolderCandidate,
  moveFolder,
  generateFolderPath,
  createFolder,
  checkCreateFolder,
  deleteFolder,
  checkRenameFolder,
  getFolderOfPath,
  getParentOfPath,
  addImage,
  moveImage,
  checkImageExists,
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

  const parent = getParentOfPath(path);
  const images = getImagesOfPath(path);
  const folders = getFoldersOfPath(path);

  res.render("document", {
    page: page("index"),
    props: {
      authed: true,
      csrf: req.csrfToken(),
      path: path.replace("/", "").split("/"),
      images,
      folders,
      parent,
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

router.get("/library/add/image", isAuthed, (req, res) => {
  const { path = "" } = req.query;

  if (!checkPathExists(path)) {
    return res.render("document", {
      page: page("error"),
      props: { authed: true, error: "Path does not exist" },
    });
  }

  res.render("document", {
    page: page("add/image"),
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

  if (new RegExp(/[^\w]|\s/g).test(name)) return res.sendStatus(403);
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
  if (folder.id !== parseInt(move)) {
    if (folder.parent_id !== parseInt(move)) {
      if (checkMoveFolderCandidate(id, move, name)) {
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

router.post("/library/image", isAuthed, (req, res) => {
  const { path } = req.query;

  if (!path) return res.sendStatus(403);
  if (!checkPathExists(path)) return res.sendStatus(403);

  let folder = getFolderOfPath(path);

  uploadImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    let image_name = req.UPLOAD_IMAGE_NAME;
    let image_src = req.UPLOAD_IMAGE_SRC;
    addImage(image_name, image_src, folder.id);

    return res.sendStatus(200);
  });
});

router.put("/library/image", isAuthed, (req, res) => {
  const { name, move, id } = req.body;
  if (!name || !move || !id) {
    return res.sendStatus(403);
  }

  // return res.status(400).json({ error: "Please complete all fields" });

  if (!checkFolderExists(move) || !checkImageExists(id)) {
    return res.sendStatus(403);
  }

  moveImage(id, move);

  res.sendStatus(200);
});

router.delete("/library/image", isAuthed, (req, res) => {
  const { id } = req.body;

  if (!id) return res.sendStatus(403);
  if (!checkImageExists(id)) return res.sendStatus(403);

  deleteImage(id);

  res.sendStatus(200);
});

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
