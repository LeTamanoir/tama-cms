export default class ValidationMiddleware {
  // to check the presence of params
  static check(obj) {
    for (let key in obj) {
      if (typeof obj[key] === "undefined" || obj[key] === "") {
        return true;
      }
    }

    return false;
  }
}
