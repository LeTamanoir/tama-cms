import folderModel from "../models/folderModel.js";
import imageModel from "../models/imageModel.js";

const page = (page) => ({
  title: "Tama-cms - Library",
  path: "pages/library/" + page,
  current: "library",
});

export default {
  getView({ path }, req, res) {
    if (!folderModel.checkPathExists(path)) {
      return res.render("document", {
        page: page("error"),
        props: { authed: true, error: "Folder not found" },
      });
    }

    const parent = folderModel.getParent(path);
    const images = imageModel.getAllFromPath(path);
    const folders = folderModel.getAllFromPath(path);

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
  },
};
