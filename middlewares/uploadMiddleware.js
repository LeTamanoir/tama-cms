import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },

  filename: (req, file, cb) => {
    let imageName = uuidv4() + path.extname(file.originalname);
    req.UPLOAD_IMAGE_SRC = imageName;
    req.UPLOAD_IMAGE_NAME = file.originalname;

    cb(null, imageName);
  },
});

const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|webp|JPEG|png|PNG|gif|GIF)$/)) {
    req.UPLOAD_ERROR = "Only image files are allowed";
    return cb(new Error("Only image files are allowed"), false);
  }

  cb(null, true);
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
}).single("image");

export { uploadImage };
