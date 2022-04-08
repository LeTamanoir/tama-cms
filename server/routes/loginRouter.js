import { Router } from "express";
import { isAuthed, isNotAuthed } from "../../middlewares/authMiddleware.js";
import Page from "../../helpers/page.js";
import validator from "../../middlewares/validationMiddleware.js";
import userController from "../../controller/userController.js";

const router = Router();
const page = new Page("Tama-cms - Login", "pages/login", "login");

router.get("/login", isNotAuthed, (req, res) => {
  res.render("document", {
    page,
    props: {
      authed: false,
      csrf: req.csrfToken(),
    },
  });
});

router.post("/login", isNotAuthed, (req, res) => {
  const { username, password } = req.body;

  if (validator.check({ username, password })) {
    return res.render("document", {
      page,
      props: {
        authed: false,
        csrf: req.csrfToken(),
        error: "Please complete all fields",
      },
    });
  }

  userController.verify({ username, password }, req, res);
});

router.get("/logout", isAuthed, (req, res) => {
  userController.logout(req, res);
});

export default router;
