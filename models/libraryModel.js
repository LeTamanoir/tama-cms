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

const getFolder = (id) => {
  const folder = libraryDB
    .prepare("select * from `folder` where `id` = @id")
    .get({ id });

  return folder;
};

const modifyFolderName = (id, name) => {
  libraryDB
    .prepare("select * from `folder` where `id` = @id")
    .run({ id, name });
};

const getMoveCandidates = (id) => {
  const moveCandidates = libraryDB
    .prepare(
      "select * from `folder` where `path` not like (select `path` from `folder` where `id` = " +
        "(select `parent_id` from `folder` where `id` = @id))||'%'"
    )
    .all({ id });

  return moveCandidates;
};

const addImage = ({ name, src, created_at, modified_at }) => {
  libraryDB
    .prepare(
      "insert into `image` ('name', 'src', 'created_at', 'modified_at') values (@name, @src, @created_at, @modified_at)"
    )
    .run({
      name,
      src,
      created_at,
      modified_at,
    });
};

const sanitizeImagePath = (_path, expect) => {
  let test = path.join("uploads/images", _path);

  if (test.startsWith(expect)) return test;

  return false;
};

const deleteImage = (image_id) => {
  let _path = sanitizeImagePath(image, "uploads/images");

  if (_path) {
    fs.unlinkSync(_path);
    return true;
  }

  return false;
};

export {
  getImagesOfPath,
  addImage,
  getFoldersOfPath,
  getFolder,
  checkFolderExists,
  checkPathExists,
  getMoveCandidates,
  deleteImage,
};
