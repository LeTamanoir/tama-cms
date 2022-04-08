import imageModel from "../models/imageModel.js";
import folderModel from "../models/folderModel.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";
import Page from "../helpers/page.js";
import FileInfo from "../helpers/fileInfo.js";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const page = new Page("Tama-cms - Library", "pages/library/", "library");

export default class ImageController {
  static addView({ path }, req, res) {
    if (!folderModel.checkPathExists(path)) {
      return res.render("document", {
        page: page.getProperties("error"),
        props: { authed: true, error: "Path does not exist" },
      });
    }

    res.render("document", {
      page: page.getProperties("add/image"),
      props: {
        authed: true,
        csrf: req.csrfToken(),
        back: path.replace("/", "").split("/").slice(0, -1).join("/"),
        path,
      },
    });
  }

  static add({ path }, req, res) {
    if (!folderModel.checkPathExists(path)) return res.sendStatus(403);

    let folder = folderModel.getFromPath(path);

    uploadImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { image, src } = req.UPLOADED_IMAGE;
      const info = FileInfo.get("uploads/images/" + src);

      imageModel.add(image, src, info, folder.id);

      res.sendStatus(200);
    });
  }

  static modifyView({ id }, req, res) {
    if (!imageModel.checkExists(id)) {
      return res.render("document", {
        page: page.getProperties("error"),
        props: { authed: true, error: "Folder not found" },
      });
    }

    const image = imageModel.get(id);
    const parent = folderModel.get(image.parent_id);
    const moveCandidates = imageModel.getMoveCandidates(id);

    res.render("document", {
      page: page.getProperties("modify/image"),
      props: {
        authed: true,
        csrf: req.csrfToken(),
        back: parent.path,
        moveCandidates,
        image,
        parent,
      },
    });
  }

  static modify({ name, id, move }, res) {
    if (!folderModel.checkExists(move)) {
      return res.sendStatus(403);
    }

    if (!imageModel.checkExists(id)) return res.sendStatus(403);

    imageModel.move(id, move);
    imageModel.modifyName(name, id);

    res.sendStatus(200);
  }

  static crop(req, res) {
    uploadImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { name, id, src, move } = req.MODIFIED_IMAGE;
      const info = FileInfo.get("uploads/images/" + src);

      imageModel.move(id, move);
      imageModel.modifyChange(name, id, src, info);

      res.sendStatus(200);
    });
  }

  static resize({ id, name, move, resize_width, resize_height }, res) {
    if (!imageModel.checkExists(id)) return res.sendStatus(403);

    if (
      resize_width < 0 ||
      resize_height < 0 ||
      resize_width > 3000 ||
      resize_height > 3000
    ) {
      return res
        .status(400)
        .json({ error: "Can't resize : dimensions are too big" });
    }

    const image = imageModel.get(id);

    let _path = "uploads/images/" + image.src;
    let imageName = uuidv4() + ".jpeg";

    sharp(_path)
      .resize({
        width: parseInt(resize_width),
        height: parseInt(resize_height),
        fit: "fill",
      })
      .toFile("uploads/images/" + imageName)
      .then(() => {
        const info = FileInfo.get("uploads/images/" + imageName);

        imageModel.move(id, move);
        imageModel.modifyChange(name, id, imageName, info);

        res.sendStatus(200);
      });
  }

  static delete({ id }, res) {
    if (!imageModel.checkExists(id)) return res.sendStatus(403);

    imageModel.delete(id);

    res.sendStatus(200);
  }
}
