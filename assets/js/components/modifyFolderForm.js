import navigate from "../utils/navigate.js";

export default function modifyFolderForm({
  back,
  _csrf,
  parent_id,
  defautl_name,
}) {
  return {
    nameValid: null,
    error: "",
    back,
    moved: false,
    _csrf,
    parent_id,
    defautl_name,

    validateName(e) {
      if (e.target.value.length === 0 || e.target.value === defautl_name) {
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
        method: "PUT",
        body: formData,
      })
        .then((res) => {
          if (res.ok) {
            navigate(`/library?path=/${this.back}`);
          } else {
            res.json().then((data) => {
              this.error = data.error;
            });
          }
        })
        .catch((e) => console.log(e));
    },

    deleteFolder(id) {
      this.$dispatch("alert", {
        title: "Delete folder",
        content:
          "Are you sure you want to delete this folder along with its content (images and sub-folders) ?",
        callback: () => {
          let formData = new URLSearchParams();
          formData.append("_csrf", _csrf);
          formData.append("id", id);

          fetch("/library/folder", {
            method: "DELETE",
            body: formData,
          })
            .then((res) => {
              if (res.ok) {
                navigate(`/library?path=/${this.back}`);
              }
            })
            .catch((e) => console.log(e));
        },
      });
    },
  };
}
