import fs from "fs";
import path from "path";
import sqlite from "better-sqlite3";
const libraryDB = new sqlite("database/library.db", {});

export default class ImageModel {
  static get(id) {
    const image = libraryDB
      .prepare("SELECT * FROM image WHERE id = @id")
      .get({ id });

    if (image.info.length !== 0) {
      image.info = JSON.parse(image.info);
    } else {
      image.info = { res: { width: 0, height: 0 }, ext: "", size: "" };
    }

    return image;
  }

  static getAllFromPath(path) {
    const images = libraryDB
      .prepare(
        "SELECT * FROM image WHERE parent_id = (SELECT id FROM folder WHERE path = @path)"
      )
      .all({ path });

    images.forEach((image) => {
      if (image.info.length !== 0) {
        image.info = JSON.parse(image.info);
      } else {
        image.info = { res: { width: 0, height: 0 }, ext: "", size: "" };
      }
    });

    return images;
  }

  static add(name, path, info, parent_id) {
    libraryDB
      .prepare(
        "INSERT into image ('name', 'src', 'info', 'parent_id', 'created_at', 'modified_at') " +
          "VALUES (@name, @src, @info, @parent_id, @created_at, @modified_at)"
      )
      .run({
        name,
        src: path,
        info: JSON.stringify(info),
        parent_id,
        created_at: new Date().getTime(),
        modified_at: new Date().getTime(),
      });
  }

  static move(id, move) {
    libraryDB
      .prepare("UPDATE image SET parent_id = @move WHERE id = @id")
      .run({ id, move });
  }

  static delete(id) {
    this.deleteDisk(id);

    libraryDB.prepare("DELETE FROM image WHERE id = @id").run({ id });
  }

  static checkExists(id) {
    let check = libraryDB
      .prepare("SELECT * FROM image WHERE id = @id")
      .get({ id });

    return !!check?.id;
  }

  static modifyName(name, id) {
    libraryDB
      .prepare(
        "UPDATE image SET name = @name, modified_at = @modified WHERE id = @id"
      )
      .run({ name, modified: new Date().getTime(), id });
  }

  static modifyChange(name, id, newSrc, info) {
    this.deleteDisk(id);

    libraryDB
      .prepare(
        "UPDATE image SET name = @name, src = @newSrc, info = @info, modified_at = @modified WHERE id = @id"
      )
      .run({
        name,
        newSrc,
        info: JSON.stringify(info),
        modified: new Date().getTime(),
        id,
      });
  }

  static getMoveCandidates(id) {
    const moveCandidates = libraryDB
      .prepare(
        "SELECT * FROM folder WHERE id != (SELECT parent_id FROM image WHERE id = @id)"
      )
      .all({ id });

    return moveCandidates;
  }

  static deleteDisk(id) {
    let { src } = libraryDB
      .prepare("SELECT * FROM image WHERE id = @id")
      .get({ id });

    try {
      fs.unlinkSync(path.join("uploads/images", src));
    } catch (err) {
      console.log(err.message);
    }
  }
}
