import sqlite from "better-sqlite3";
const libraryDB = new sqlite("database/library.db", {});
import imageModel from "./imageModel.js";

export default class FolderModel {
  static add(name, path, parent_id) {
    libraryDB
      .prepare(
        "INSERT into folder (name, path, parent_id) VALUES (@name, @path, @parent_id)"
      )
      .run({
        name,
        path,
        parent_id,
      });
  }

  static get(id) {
    const folder = libraryDB
      .prepare("SELECT * FROM folder WHERE id = @id")
      .get({ id });

    return folder;
  }

  static move(id, move) {
    libraryDB
      .prepare("UPDATE folder SET parent_id = @move WHERE id = @id")
      .run({ move, id });
  }

  static delete(id) {
    const subFolders = libraryDB
      .prepare(
        "SELECT * FROM folder WHERE path LIKE (SELECT path FROM folder WHERE id = @id)||'/%' OR id = @id"
      )
      .all({ id });

    for (let folder of subFolders) {
      const images = imageModel.getAllFromPath(folder.path);
      for (let image of images) {
        imageModel.delete(image.id);
      }
    }

    libraryDB
      .prepare(
        "DELETE FROM folder WHERE path LIKE (SELECT path FROM folder WHERE id = @id)||'/%' OR id = @id"
      )
      .run({ id });
  }

  static checkExists(id) {
    const check = libraryDB
      .prepare("SELECT id FROM folder WHERE id = @id")
      .get({ id });

    return !!check?.id;
  }

  static checkPathExists(path) {
    const check = libraryDB
      .prepare("SELECT id FROM folder WHERE path = @path")
      .get({ path });

    return !!check?.id;
  }

  static checkRename(id, name) {
    let check = libraryDB
      .prepare(
        "SELECT id FROM folder WHERE parent_id = (SELECT parent_id FROM folder WHERE id = @id)" +
          " and name = @name and id != @id"
      )
      .get({ id, name });

    return !check?.id;
  }

  static getFromPath(path) {
    const folder = libraryDB
      .prepare("SELECT * FROM folder WHERE path = @path")
      .get({ path });

    return folder;
  }

  static checkAdd(id, name) {
    let check = libraryDB
      .prepare("SELECT id FROM folder WHERE name = @name and parent_id = @id")
      .get({ id, name });

    return !check?.id;
  }

  static modifyName(id, name) {
    libraryDB
      .prepare("UPDATE folder SET name = @name WHERE id = @id")
      .run({ id, name });
  }

  static checkMoveCandidate(id, move, name) {
    let check = libraryDB
      .prepare(
        "SELECT * FROM folder WHERE path NOT LIKE (SELECT path FROM folder WHERE id = @id)||'/%'" +
          " and id = @move and NOT EXISTS (SELECT 1 FROM folder WHERE parent_id = @move and name = @name)"
      )
      .get({ id, name, move });

    return !!check?.id;
  }

  static generatePath(id, move, name) {
    let oldPath = libraryDB
      .prepare("SELECT path FROM folder WHERE id = @id")
      .get({ id }).path;

    let _path = libraryDB
      .prepare("SELECT path FROM folder WHERE id = @move")
      .get({ move }).path;

    let newPath = (_path !== "/" ? _path + "/" : "/") + name;

    libraryDB
      .prepare(
        "UPDATE folder SET path = REPLACE(path, @oldPath, @newPath) WHERE path LIKE @oldPath||'/%' OR path = @oldPath"
      )
      .run({ newPath, oldPath, id });
  }

  static getMoveCandidates(id) {
    const moveCandidates = libraryDB
      .prepare(
        "SELECT * FROM folder WHERE path NOT LIKE (SELECT path FROM folder WHERE id = @id)||'/%'" +
          " and id != (SELECT parent_id FROM folder WHERE id = @id) and id != @id"
      )
      .all({ id });
    return moveCandidates;
  }

  static getAllFromPath(path) {
    const folders = libraryDB
      .prepare(
        "SELECT * FROM folder WHERE parent_id = (SELECT id FROM folder WHERE path = @path)"
      )
      .all({ path });

    return folders;
  }

  static getParent(path) {
    const folder = libraryDB
      .prepare(
        "SELECT * FROM folder WHERE id = (SELECT parent_id FROM folder WHERE path = @path)"
      )
      .get({
        path,
      });

    return folder;
  }
}
