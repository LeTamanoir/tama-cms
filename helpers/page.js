class Page {
  constructor(title, path, current) {
    (this.title = title), (this.path = path), (this.current = current);
  }

  getProperties(page) {
    return {
      title: this.title,
      path: this.path + page,
      current: this.current,
    };
  }
}

export default Page;
