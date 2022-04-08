import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import imageModel from "../models/imageModel.js";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },

  filename: (req, file, cb) => {
    if (req.method === "PUT") {
      const { name, id } = req.body;

      if (!name || !id) {
        return cb(new Error("Please complete all fields"), null);
      }

      if (!imageModel.checkExists(id)) {
        return cb(new Error("Please complete all fields"), null);
      }

      let imageName = uuidv4() + ".jpeg";

      imageModel.modifyCrop(name, id, imageName);
      cb(null, imageName);
    }

    if (req.method === "POST") {
      let imageName = uuidv4() + path.extname(file.originalname);
      req.UPLOAD_IMAGE_SRC = imageName;
      req.UPLOAD_IMAGE_NAME = file.originalname.replace(
        /\.(jpg|JPG|jpeg|webp|JPEG|png|PNG|gif|GIF)$/g,
        ""
      );

      cb(null, imageName);
    }
  },
});

const imageFilter = (req, file, cb) => {
  if (req.method === "POST") {
    if (
      !file.originalname.match(/\.(jpg|JPG|jpeg|webp|JPEG|png|PNG|gif|GIF)$/)
    ) {
      req.UPLOAD_ERROR = "Only image files are allowed";
      return cb(new Error("Only image files are allowed"), false);
    }
  }

  cb(null, true);
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
}).single("image");

export { uploadImage };
