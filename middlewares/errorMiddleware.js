const errorHandler = (err, req, res, next) => {
  if (err) {
    switch (err.code) {
      case "EBADCSRFTOKEN":
        console.error("bad csrf token !");
        res.sendStatus(403);
        break;
      default:
        res.sendStatus(500);
    }
  } else {
    next();
  }
};

export default errorHandler;
