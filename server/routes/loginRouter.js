import express from "express";
import { getUser } from "../../controllers/userController.js";
import { isAuthed, isNotAuthed } from "../../middlewares/authMiddleware.js";

const router = express.Router();

const page = {
  title: "Tama-cms - Login",
  path: "pages/login",
  current: "login",
};

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

  if (!username || !password) {
    return res.render("document", {
      page,
      props: {
        authed: false,
        csrf: req.csrfToken(),
        error: "Please complete all fields",
      },
    });
  }

  const user = getUser(username, password);

  if (user) {
    req.session.user = user;
    req.session.save();

    return res.redirect("/");
  }

  res.render("document", {
    page,
    props: {
      authed: false,
      csrf: req.csrfToken(),
      error: "Username or password invalid",
    },
  });
});

router.get("/logout", isAuthed, (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;
