import folderModel from "../models/folderModel.js";
import imageModel from "../models/imageModel.js";
import Page from "../helpers/page.js";

const page = new Page("Tama-cms - Library", "pages/library/", "library");

export default class LibraryController {
  static getView({ path }, req, res) {
    if (!folderModel.checkPathExists(path)) {
      return res.render("document", {
        page: page.getProperties("error"),
        props: { authed: true, error: "Folder not found" },
      });
    }

    const parent = folderModel.getParent(path);
    const images = imageModel.getAllFromPath(path);
    const folders = folderModel.getAllFromPath(path);

    res.render("document", {
      page: page.getProperties("index"),
      props: {
        authed: true,
        csrf: req.csrfToken(),
        path: path.replace("/", "").split("/"),
        images,
        folders,
        parent,
      },
    });
  }
}
