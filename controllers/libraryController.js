import fs from "fs";
import path from "path";

const getImages = () => {
  return fs.readdirSync("uploads/images");
};

const sanitizeImagePath = (_path, expect) => {
  let test = path.join("uploads/images", _path);

  if (test.startsWith(expect)) return test;

  return false;
};

const deleteImage = (image) => {
  let _path = sanitizeImagePath(image, "uploads/images");

  if (_path) {
    fs.unlinkSync(_path);
    return true;
  }

  return false;
};

export { getImages, deleteImage };
