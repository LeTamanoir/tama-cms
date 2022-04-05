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

const checkMoveCandidate = (id, move, name) => {
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
  deleteFolder,
  getFoldersOfPath,
  getFolderOfPath,
  getFolder,
  checkFolderExists,
  checkPathExists,
  getMoveCandidates,
  modifyFolderName,
  deleteImage,
  checkMoveCandidate,
  generateFolderPath,
  moveFolder,
  checkRenameFolder,
  createFolder,
  checkCreateFolder,
};
