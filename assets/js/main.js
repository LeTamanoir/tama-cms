function responsivePage() {
  window.onpopstate = (e) => navigate(e.state.location, true);

  return {
    navigate,
  };
}

function navigate(url, fromPopState = false) {
  fetch(url)
    .then((res) => res.text())
    .then((text) => {
      let newElem = new DOMParser()
        .parseFromString(text, "text/html")
        .querySelector("main").innerHTML;

      document.querySelector("main").innerHTML = newElem;

      if (fromPopState) return;

      let old_location = document.location.pathname + document.location.search;
      window.history.replaceState({ location: old_location }, "", old_location);
      window.history.pushState({ location: url }, "", url);
    })
    .catch((e) => console.log(e));
}

function addFolderForm(back) {
  return {
    error: "",
    nameValid: null,

    back,

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
          navigate(`/library?path=/${this.back}`);
        } else {
          res.json().then((data) => {
            this.error = data.error;
          });
        }
      });
    },
  };
}

function manageAlert() {
  return {
    show: false,
    title: "",
    content: "",
    callback: () => {},

    showAlert(e) {
      this.show = true;

      this.title = e.detail.title;
      this.content = e.detail.content;
      this.callback = e.detail.callback;
    },

    clearAlert() {
      this.show = false;
      this.title = "";
      this.content = "";
    },

    cancelAlert() {
      this.clearAlert();
    },

    confirmAlert() {
      this.clearAlert();

      this.callback();
    },
  };
}

function modifyFolderForm(back, _csrf, parent_id, defautl_name) {
  return {
    nameValid: null,
    moveTo: "",
    error: "",
    back,
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
            // folder was not moved so navigate back
            if (formData.get("move") === this.parent_id) {
              navigate(`/library?path=/${this.back}`);
            }
            // folder was moved so navigate to new location
            else {
              navigate(`/library?path=${this.moveTo}`);
            }
          }
          // load the error message
          else {
            res.json().then((data) => {
              this.error = data.error;
            });
          }
        })
        .catch((e) => console.log(e));
    },

    setMoveTo(e) {
      this.moveTo = e.target.selectedOptions[0].getAttribute("t-move-to");
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
          }).then((res) => {
            if (res.ok) {
              navigate(`/library?path=/${this.back}`);
            }
          });
        },
      });
    },
  };
}
