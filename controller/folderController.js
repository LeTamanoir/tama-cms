import folderModel from "../models/folderModel.js";
import Page from "../helpers/page.js";

const page = new Page("Tama-cms - Library", "pages/library/", "library");

export default class FolderController {
  static addView({ path }, req, res) {
    if (!folderModel.checkPathExists(path)) {
      return res.render("document", {
        page: page.getProperties("error"),
        props: { authed: true, error: "Path does not exist" },
      });
    }

    res.render("document", {
      page: page.getProperties("add/folder"),
      props: {
        authed: true,
        csrf: req.csrfToken(),
        back: path.replace("/", "").split("/").slice(0, -1).join("/"),
        path,
      },
    });
  }

  static add({ name, path }, res) {
    if (!folderModel.checkPathExists(path)) return res.sendStatus(403);

    const parent = folderModel.getFromPath(path);

    if (folderModel.checkAdd(parent.id, name)) {
      folderModel.add(
        name,
        (path !== "/" ? path + "/" : "/") + name,
        parent.id
      );

      return res.sendStatus(200);
    }

    res.status(400).json({ error: `"${name}" already exists in directory` });
  }

  static delete({ id }, res) {
    if (!folderModel.checkExists(id)) return res.sendStatus(403);

    folderModel.delete(id);

    res.sendStatus(200);
  }

  static modifyView({ id }, req, res) {
    if (!folderModel.checkExists(id)) {
      return res.render("document", {
        page: page.getProperties("error"),
        props: { authed: true, error: "Folder not found" },
      });
    }

    const folder = folderModel.get(id);
    const moveCandidates = folderModel.getMoveCandidates(id);

    res.render("document", {
      page: page.getProperties("modify/folder"),
      props: {
        authed: true,
        csrf: req.csrfToken(),
        back: folder.path.replace("/", "").split("/").slice(0, -1).join("/"),
        folder,
        moveCandidates,
      },
    });
  }

  static modify({ name, move, id }, res) {
    if (new RegExp(/[^\w]|\s/g).test(name)) return res.sendStatus(403);
    if (!folderModel.checkExists(id)) return res.sendStatus(403);

    const folder = folderModel.get(id);

    // first rename
    if (folder.name !== name) {
      if (folderModel.checkRename(id, name)) {
        folderModel.modifyName(id, name);
      } else {
        return res.status(400).json({ error: `"${name}" already exists` });
      }
    }

    // then move
    if (folder.id !== parseInt(move)) {
      if (folder.parent_id !== parseInt(move)) {
        if (folderModel.checkMoveCandidate(id, move, name)) {
          folderModel.move(id, move);
          folderModel.generatePath(id, move, name);
        } else {
          return res
            .status(400)
            .json({ error: `"${name}" already exists at chosen destination` });
        }
      } else {
        // folder not moved
        folderModel.generatePath(id, move, name);
      }
    }

    res.sendStatus(200);
  }
}
