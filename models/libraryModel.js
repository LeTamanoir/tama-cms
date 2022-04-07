import fs from "fs";
import path from "path";
import sqlite from "better-sqlite3";
const libraryDB = new sqlite("database/library.db", {});

const getImagesOfPath = (path) => {
  const images = libraryDB
    .prepare(
      "select * from `image` where `parent_id` = (select `id` from `folder` where `path` = @path)"
    )
    .all({ path });

  return images;
};

const checkFolderExists = (id) => {
  const check = libraryDB
    .prepare("select `id` from `folder` where `id` = @id")
    .get({ id });

  return !!check?.id;
};

const checkPathExists = (path) => {
  const check = libraryDB
    .prepare("select `id` from `folder` where `path` = @path")
    .get({ path });

  return !!check?.id;
};

const getFoldersOfPath = (path) => {
  const folders = libraryDB
    .prepare(
      "select * from `folder` where `parent_id` = (select `id` from `folder` where `path` = @path)"
    )
    .all({ path });

  return folders;
};

const getFolderOfPath = (path) => {
  const folders = libraryDB
    .prepare("select * from `folder` where `path` = @path")
    .get({ path });

  return folders;
};

const getParentOfPath = (path) => {
  const folder = libraryDB
    .prepare(
      "select * from `folder` where `id` = (select `parent_id` from `folder` where `path` = @path)"
    )
    .get({
      path,
    });

  return folder;
};

const getFolder = (id) => {
  const folder = libraryDB
    .prepare("select * from `folder` where `id` = @id")
    .get({ id });

  return folder;
};

const modifyFolderName = (id, name) => {
  libraryDB
    .prepare("update `folder` set `name` = @name where `id` = @id")
    .run({ id, name });
};

const checkRenameFolder = (id, name) => {
  let check = libraryDB
    .prepare(
      "select `id` from `folder` where `parent_id` = (select `parent_id` from `folder` where `id` = @id)" +
        " and `name` = @name and `id` != @id"
    )
    .get({ id, name });

  return !check?.id;
};

const checkCreateFolder = (id, name) => {
  let check = libraryDB
    .prepare(
      "select `id` from `folder` where `name` = @name and `parent_id` = @id"
    )
    .get({ id, name });

  return !check?.id;
};

const createFolder = (name, path, parent_id) => {
  libraryDB
    .prepare(
      "insert into `folder` (`name`, `path`, `parent_id`) values (@name, @path, @parent_id)"
    )
    .run({
      name,
      path,
      parent_id,
    });
};

const getMoveCandidates = (id) => {
  const moveCandidates = libraryDB
    .prepare(
      "select * from `folder` where `path` not like (select `path` from `folder` where `id` = @id)||'/%'" +
        " and `id` != (select `parent_id` from `folder` where `id` = @id) and `id` != @id"
    )
    .all({ id });
  return moveCandidates;
};

const checkMoveFolderCandidate = (id, move, name) => {
  let check = libraryDB
    .prepare(
      "select * from `folder` where `path` not like (select `path` from `folder` where `id` = @id)||'/%'" +
        " and `id` = @move and not exists (select 1 from `folder` where `parent_id` = @move and `name` = @name)"
    )
    .get({ id, name, move });

  return !!check?.id;
};

const moveFolder = (id, move) => {
  libraryDB
    .prepare("update `folder` set `parent_id` = @move where `id` = @id")
    .run({ move, id });
};

const generateFolderPath = (id, move, name) => {
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
};

const deleteFolder = (id) => {
  libraryDB
    .prepare(
      "delete from `folder` where `path` like (select `path` from `folder` where `id` = @id)||'/%' or `id` = @id"
    )
    .run({ id });
};

const addImage = (name, path, parent_id) => {
  libraryDB
    .prepare(
      "insert into `image` ('name', 'src', 'parent_id', 'created_at', 'modified_at') values (@name, @src, @parent_id, @created_at, @modified_at)"
    )
    .run({
      name,
      src: path,
      parent_id,
      created_at: new Date().getTime(),
      modified_at: new Date().getTime(),
    });
};

const moveImage = (id, move) => {
  libraryDB
    .prepare("update `image` set `parent_id` = @move where `id` = @id")
    .run({ id, move });
};

const getImage = (id) => {
  const image = libraryDB
    .prepare("select * from `image` where `id` = @id")
    .get({ id });

  return image;
};

const checkImageExists = (id) => {
  let check = libraryDB
    .prepare("select * from `image` where `id` = @id")
    .get({ id });

  return !!check?.id;
};

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

const deleteImage = (id) => {
  deleteImageDisk(id);

  libraryDB.prepare("delete from `image` where `id` = @id").run({ id });
};

const modifyImage = (name, id, newSrc) => {
  deleteImageDisk(id);

  libraryDB
    .prepare(
      "update `image` set `name` = @name, `src` = @newSrc, `modified_at` = @modified where `id` = @id"
    )
    .run({ name, newSrc, modified: new Date().getTime(), id });
};

const modifyImageName = (name, id) => {
  libraryDB
    .prepare(
      "update `image` set `name` = @name, `modified_at` = @modified where `id` = @id"
    )
    .run({ name, modified: new Date().getTime(), id });
};

export {
  modifyImage,
  modifyImageName,
  getImagesOfPath,
  getImage,
  moveImage,
  addImage,
  deleteFolder,
  getFoldersOfPath,
  getFolderOfPath,
  getFolder,
  checkFolderExists,
  checkPathExists,
  getMoveCandidates,
  modifyFolderName,
  deleteImage,
  checkImageExists,
  checkMoveFolderCandidate,
  generateFolderPath,
  moveFolder,
  checkRenameFolder,
  createFolder,
  getParentOfPath,
  checkCreateFolder,
};
