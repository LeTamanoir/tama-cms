import imageModel from "../models/imageModel.js";
import folderModel from "../models/folderModel.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const page = (page) => ({
  title: "Tama-cms - Library",
  path: "pages/library/" + page,
  current: "library",
});

export default {
  addView({ path }, req, res) {
    if (!folderModel.checkPathExists(path)) {
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
  },

  add({ path }, req, res) {
    if (!folderModel.checkPathExists(path)) return res.sendStatus(403);

    let folder = folderModel.getFromPath(path);

    uploadImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      let image_name = req.UPLOAD_IMAGE_NAME;
      let image_src = req.UPLOAD_IMAGE_SRC;
      imageModel.add(image_name, image_src, folder.id);

      res.sendStatus(200);
    });
  },

  modifyView({ id }, req, res) {
    if (!imageModel.checkExists(id)) {
      return res.render("document", {
        page: page("error"),
        props: { authed: true, error: "Folder not found" },
      });
    }

    const image = imageModel.get(id);
    const parent = folderModel.get(image.parent_id);
    const moveCandidates = imageModel.getMoveCandidates(id);

    res.render("document", {
      page: page("modify/image"),
      props: {
        authed: true,
        csrf: req.csrfToken(),
        back: parent.path,
        moveCandidates,
        image,
        parent,
      },
    });
  },

  modify({ name, id, move }, res) {
    if (!folderModel.checkExists(move)) {
      return res.sendStatus(403);
    }

    if (!imageModel.checkExists(id)) return res.sendStatus(403);

    if (new RegExp(/[^\w]|\s/g).test(name)) return res.sendStatus(403);

    imageModel.move(id, move);
    imageModel.modifyName(name, id);

    res.sendStatus(200);
  },

  crop(req, res) {
    uploadImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.sendStatus(200);
    });
  },

  delete({ id }, req) {
    if (!imageModel.checkExists(id)) return res.sendStatus(403);

    imageModel.delete(id);

    res.sendStatus(200);
  },
};
