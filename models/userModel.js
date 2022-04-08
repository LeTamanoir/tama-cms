import sqlite from "better-sqlite3";
const userDB = new sqlite("database/user.db", {});

export default class UserModel {
  static getFromName(username) {
    const user = userDB
      .prepare("select * from `user` where `username` = @username")
      .get({ username });

    return user;
  }
}
