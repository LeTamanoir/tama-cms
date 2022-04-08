import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import Page from "../helpers/page.js";

const page = new Page("Tama-cms - Login", "pages/login", "login");

export default class UserController {
  static async verify({ username, password }, req, res) {
    const user = userModel.getFromName(username);

    if (!user) {
      return res.render("document", {
        page,
        props: {
          authed: false,
          csrf: req.csrfToken(),
          error: "Username or password invalid",
        },
      });
    }

    try {
      if (await bcrypt.compare(password, user.password_hash)) {
        delete user.password_hash;
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
    } catch (err) {
      console.log(err);
    }
  }

  static add() {
    // await bcrypt.hash(mot_de_passe, 10)
  }

  static logout(req, res) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  }
}
