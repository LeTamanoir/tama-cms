import fs from "fs";
import path from "path";
import sqlite from "better-sqlite3";
const libraryDB = new sqlite("database/library.db", {});

const deleteImageDisk = (id) => {
  let { src } = libraryDB
    .prepare("select * from `image` where `id` = @id")
    .get({ id });

  try {
    fs.unlinkSync(path.join("uploads/images", src));
  } catch (err) {
    console.log(err.message);
  }
};

export default class ImageModel {
  static get(id) {
    const image = libraryDB
      .prepare("select * from `image` where `id` = @id")
      .get({ id });

    return image;
  }

  static getFromPath(path) {
    const images = libraryDB
      .prepare(
        "select * from `image` where `parent_id` = (select `id` from `folder` where `path` = @path)"
      )
      .all({ path });

    return images;
  }

  static add(name, path, parent_id) {
    libraryDB
      .prepare(
        "insert into `image` ('name', 'src', 'parent_id', 'created_at', 'modified_at') " +
          "values (@name, @src, @parent_id, @created_at, @modified_at)"
      )
      .run({
        name,
        src: path,
        parent_id,
        created_at: new Date().getTime(),
        modified_at: new Date().getTime(),
      });
  }

  static move(id, move) {
    libraryDB
      .prepare("update `image` set `parent_id` = @move where `id` = @id")
      .run({ id, move });
  }

  static delete(id) {
    deleteImageDisk(id);

    libraryDB.prepare("delete from `image` where `id` = @id").run({ id });
  }

  static checkExists(id) {
    let check = libraryDB
      .prepare("select * from `image` where `id` = @id")
      .get({ id });

    return !!check?.id;
  }

  static modifyName(name, id) {
    libraryDB
      .prepare(
        "update `image` set `name` = @name, `modified_at` = @modified where `id` = @id"
      )
      .run({ name, modified: new Date().getTime(), id });
  }

  static modifyCrop(name, id, newSrc) {
    deleteImageDisk(id);

    libraryDB
      .prepare(
        "update `image` set `name` = @name, `src` = @newSrc, `modified_at` = @modified where `id` = @id"
      )
      .run({ name, newSrc, modified: new Date().getTime(), id });
  }

  static getMoveCandidates(id) {
    const moveCandidates = libraryDB
      .prepare(
        "select * from `folder` where `id` != (select `parent_id` from `image` where `id` = @id)"
      )
      .all({ id });

    return moveCandidates;
  }

  static getAllFromPath(path) {
    const images = libraryDB
      .prepare(
        "select * from `image` where `parent_id` = (select `id` from `folder` where `path` = @path)"
      )
      .all({ path });

    return images;
  }
}
