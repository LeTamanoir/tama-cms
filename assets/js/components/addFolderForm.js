import navigate from "../utils/navigate.js";

export default function addFolderForm({ path }) {
  return {
    error: "",
    nameValid: null,
    path,

    validateName(e) {
      if (e.target.value.length === 0) {
        this.error = "";
        this.nameValid = null;
        return;
      }

      if (new RegExp(/[^\w]|\s/g).test(e.target.value)) {
        this.error = "Name must match alphanumeric chars and no whitespace";
        this.nameValid = false;
      } else {
        this.error = "";
        this.nameValid = true;
      }
    },

    submit(e) {
      let formData = new URLSearchParams(new FormData(e.target));

      fetch("/library/folder", {
        method: "POST",
        body: formData,
      }).then((res) => {
        if (res.ok) {
          navigate(`/library?path=${this.path}`);
        } else {
          res.json().then((data) => {
            this.error = data.error;
          });
        }
      });
    },
  };
}
