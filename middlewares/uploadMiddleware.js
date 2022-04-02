import multer from "multer";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|webp|JPEG|png|PNG|gif|GIF)$/)) {
    return cb(new Error("Only image files are allowed"), false);
  }

  cb(null, true);
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
}).single("upload_image");

export { uploadImage };
