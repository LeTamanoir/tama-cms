import express from "express";
import session from "express-session";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import sqlite from "better-sqlite3";
import createSqliteStore from "better-sqlite3-session-store";

import "dotenv/config";

import loginRouter from "./routes/loginRouter.js";
import libraryRouter from "./routes/libraryRouter.js";
import errorMiddleware from "../middlewares/errorMiddleware.js";

const app = express();
const SqliteStore = createSqliteStore(session);
const sessionsDB = new sqlite("database/sessions.db", {});

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    name: "sid",
    saveUninitialized: false,
    resave: false,
    secret: process.env.SECRET,

    cookie: {
      maxAge: 1000 * 60 * 60,
      sameSite: true,
      secure: false,
    },

    store: new SqliteStore({
      client: sessionsDB,
      expired: {
        clear: true,
        intervalMs: 900000,
      },
    }),
  })
);
app.use(csurf({ cookie: true }));
app.use(errorMiddleware);

app.use("/assets", express.static("assets"));

app.get("/", (req, res) => {
  const user = req.session.user;

  res.render("document", {
    page: { title: "Tama-cms", path: "pages/index", current: "index" },
    props: {
      authed: !!user,
    },
  });
});

app.use(loginRouter);
app.use(libraryRouter);

app.listen(process.env.PORT, () =>
  console.log(`server : http://localhost:${process.env.PORT}`)
);
