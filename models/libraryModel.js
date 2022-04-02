import fs from "fs";
import path from "path";
import sqlite from "better-sqlite3";
const libraryDB = new sqlite("database/library.db", {});

const getImages = (path) => {
  const images = libraryDB
    .prepare(
      "select * from `image` where `parent_id` = (select `id` from `folder` where `path` = @path)"
    )
    .all({ path });

  return images;
};

const getFolders = (path) => {
  const folders = libraryDB
    .prepare(
      "select * from `folder` where `parent_id` = (select `id` from `folder` where `path` = @path)"
    )
    .all({ path });

  return folders;
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

export { getImages, addImage, getFolders, deleteImage };
