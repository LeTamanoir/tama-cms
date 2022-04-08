import path from "path";
import fs from "fs";
import getResolution from "image-size";

export default class FileInfo {
  static humanReadable(size) {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (
      (size / Math.pow(1024, i)).toFixed(2) * 1 +
      " " +
      ["B", "KB", "MB", "GB", "TB"][i]
    );
  }

  static get(_path) {
    let res = getResolution(_path);

    const info = {
      ext: path.extname(_path),
      size: this.humanReadable(fs.statSync(_path).size),
      res: { height: res.height, width: res.width },
    };

    return info;
  }
}
