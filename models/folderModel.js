import fs from "fs";
import path from "path";
import sqlite from "better-sqlite3";
const libraryDB = new sqlite("database/library.db", {});

export default {
  add(name, path, parent_id) {
    libraryDB
      .prepare(
        "insert into `folder` (`name`, `path`, `parent_id`) values (@name, @path, @parent_id)"
      )
      .run({
        name,
        path,
        parent_id,
      });
  },

  get(id) {
    const folder = libraryDB
      .prepare("select * from `folder` where `id` = @id")
      .get({ id });

    return folder;
  },

  move(id, move) {
    libraryDB
      .prepare("update `folder` set `parent_id` = @move where `id` = @id")
      .run({ move, id });
  },

  delete(id) {
    libraryDB
      .prepare(
        "delete from `folder` where `path` like (select `path` from `folder` where `id` = @id)||'/%' or `id` = @id"
      )
      .run({ id });
  },

  checkExists(id) {
    const check = libraryDB
      .prepare("select `id` from `folder` where `id` = @id")
      .get({ id });

    return !!check?.id;
  },

  checkPathExists(path) {
    const check = libraryDB
      .prepare("select `id` from `folder` where `path` = @path")
      .get({ path });

    return !!check?.id;
  },

  checkRename(id, name) {
    let check = libraryDB
      .prepare(
        "select `id` from `folder` where `parent_id` = (select `parent_id` from `folder` where `id` = @id)" +
          " and `name` = @name and `id` != @id"
      )
      .get({ id, name });

    return !check?.id;
  },

  getFromPath(path) {
    const folders = libraryDB
      .prepare("select * from `folder` where `path` = @path")
      .get({ path });

    return folders;
  },

  checkAdd(id, name) {
    let check = libraryDB
      .prepare(
        "select `id` from `folder` where `name` = @name and `parent_id` = @id"
      )
      .get({ id, name });

    return !check?.id;
  },

  modifyName(id, name) {
    libraryDB
      .prepare("update `folder` set `name` = @name where `id` = @id")
      .run({ id, name });
  },

  checkMoveCandidate(id, move, name) {
    let check = libraryDB
      .prepare(
        "select * from `folder` where `path` not like (select `path` from `folder` where `id` = @id)||'/%'" +
          " and `id` = @move and not exists (select 1 from `folder` where `parent_id` = @move and `name` = @name)"
      )
      .get({ id, name, move });

    return !!check?.id;
  },

  generatePath(id, move, name) {
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
  },

  getMoveCandidates(id) {
    const moveCandidates = libraryDB
      .prepare(
        "select * from `folder` where `path` not like (select `path` from `folder` where `id` = @id)||'/%'" +
          " and `id` != (select `parent_id` from `folder` where `id` = @id) and `id` != @id"
      )
      .all({ id });
    return moveCandidates;
  },

  getAllFromPath(path) {
    const folders = libraryDB
      .prepare(
        "select * from `folder` where `parent_id` = (select `id` from `folder` where `path` = @path)"
      )
      .all({ path });

    return folders;
  },

  getParent(path) {
    const folder = libraryDB
      .prepare(
        "select * from `folder` where `id` = (select `parent_id` from `folder` where `path` = @path)"
      )
      .get({
        path,
      });

    return folder;
  },
};
