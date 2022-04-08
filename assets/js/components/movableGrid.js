import navigate from "../utils/navigate.js";

export default function movableGrid(_csrf, path) {
  return {
    current: null,
    current_name: "",
    current_over: null,
    dragging: false,
    type: "",
    path,
    _csrf,

    setCurrent(id) {
      this.current = id;
    },

    isOver(id) {
      return this.dragging && this.current !== id && this.current_over === id;
    },

    handleMove() {
      if (this.current === this.current_over) return;

      let formData = new URLSearchParams();

      if (this.type === "folder") {
        formData.append("name", this.current_name);
        formData.append("move", this.current_over);
        formData.append("id", this.current);
        formData.append("_csrf", this._csrf);

        fetch("/library/folder", {
          method: "PUT",
          body: formData,
        }).then((res) => {
          if (res.ok) {
            navigate(`/library?path=/${this.path}`);
          }
        });
      }

      if (this.type === "image") {
        formData.append("name", this.current_name);
        formData.append("move", this.current_over);
        formData.append("id", this.current);
        formData.append("_csrf", this._csrf);

        fetch("/library/image", {
          method: "PUT",
          body: formData,
        }).then((res) => {
          if (res.ok) {
            navigate(`/library?path=/${this.path}`);
          }
        });
      }
    },

    deleteImage(id) {
      this.$dispatch("alert", {
        title: "Delete image",
        content: "Are you sure you want to delete this image ?",
        callback: () => {
          let formData = new URLSearchParams();
          formData.append("_csrf", _csrf);
          formData.append("id", id);

          fetch("/library/image", {
            method: "DELETE",
            body: formData,
          }).then((res) => {
            if (res.ok) {
              navigate(`/library?path=/${this.path}`);
            }
          });
        },
      });
    },
  };
}
