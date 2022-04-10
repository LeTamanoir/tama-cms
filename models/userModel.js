import sqlite from "better-sqlite3";
const userDB = new sqlite("database/user.db", {});

export default class UserModel {
  static getFromName(username) {
    const user = userDB
      .prepare("SELECT * FROM user WHERE username = @username")
      .get({ username });

    return user;
  }
}
