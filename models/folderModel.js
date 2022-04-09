import sqlite from "better-sqlite3";
const libraryDB = new sqlite("database/library.db", {});
import imageModel from "./imageModel.js";

export default class FolderModel {
  static add(name, path, parent_id) {
    libraryDB
      .prepare(
        "insert into `folder` (`name`, `path`, `parent_id`) values (@name, @path, @parent_id)"
      )
      .run({
        name,
        path,
        parent_id,
      });
  }

  static get(id) {
    const folder = libraryDB
      .prepare("select * from `folder` where `id` = @id")
      .get({ id });

    return folder;
  }

  static move(id, move) {
    libraryDB
      .prepare("update `folder` set `parent_id` = @move where `id` = @id")
      .run({ move, id });
  }

  static delete(id) {
    const subFolders = libraryDB
      .prepare(
        "select * from `folder` where `path` like (select `path` from `folder` where `id` = @id)||'/%' or `id` = @id"
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
        "delete from `folder` where `path` like (select `path` from `folder` where `id` = @id)||'/%' or `id` = @id"
      )
      .run({ id });
  }

  static checkExists(id) {
    const check = libraryDB
      .prepare("select `id` from `folder` where `id` = @id")
      .get({ id });

    return !!check?.id;
  }

  static checkPathExists(path) {
    const check = libraryDB
      .prepare("select `id` from `folder` where `path` = @path")
      .get({ path });

    return !!check?.id;
  }

  static checkRename(id, name) {
    let check = libraryDB
      .prepare(
        "select `id` from `folder` where `parent_id` = (select `parent_id` from `folder` where `id` = @id)" +
          " and `name` = @name and `id` != @id"
      )
      .get({ id, name });

    return !check?.id;
  }

  static getFromPath(path) {
    const folder = libraryDB
      .prepare("select * from `folder` where `path` = @path")
      .get({ path });

    return folder;
  }

  static checkAdd(id, name) {
    let check = libraryDB
      .prepare(
        "select `id` from `folder` where `name` = @name and `parent_id` = @id"
      )
      .get({ id, name });

    return !check?.id;
  }

  static modifyName(id, name) {
    libraryDB
      .prepare("update `folder` set `name` = @name where `id` = @id")
      .run({ id, name });
  }

  static checkMoveCandidate(id, move, name) {
    let check = libraryDB
      .prepare(
        "select * from `folder` where `path` not like (select `path` from `folder` where `id` = @id)||'/%'" +
          " and `id` = @move and not exists (select 1 from `folder` where `parent_id` = @move and `name` = @name)"
      )
      .get({ id, name, move });

    return !!check?.id;
  }

  static generatePath(id, move, name) {
    let oldPath = libraryDB
      .prepare("select `path` from `folder` where `id` = @id")
      .get({ id }).path;

    let _path = libraryDB
      .prepare("select `path` from `folder` where `id` = @move")
      .get({ move }).path;

    let newPath = (_path !== "/" ? _path + "/" : "/") + name;

    libraryDB
      .prepare(
        "update `folder` set `path` = replace(`path`, @oldPath, @newPath) where `path` like @oldPath||'/%' or `path` = @oldPath"
      )
      .run({ newPath, oldPath, id });
  }

  static getMoveCandidates(id) {
    const moveCandidates = libraryDB
      .prepare(
        "select * from `folder` where `path` not like (select `path` from `folder` where `id` = @id)||'/%'" +
          " and `id` != (select `parent_id` from `folder` where `id` = @id) and `id` != @id"
      )
      .all({ id });
    return moveCandidates;
  }

  static getAllFromPath(path) {
    const folders = libraryDB
      .prepare(
        "select * from `folder` where `parent_id` = (select `id` from `folder` where `path` = @path)"
      )
      .all({ path });

    return folders;
  }

  static getParent(path) {
    const folder = libraryDB
      .prepare(
        "select * from `folder` where `id` = (select `parent_id` from `folder` where `path` = @path)"
      )
      .get({
        path,
      });

    return folder;
  }
}
