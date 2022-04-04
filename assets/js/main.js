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

function modifyFolderForm(parent_id) {
  return {
    moveTo: "",
    error: "",

    submit(e, back) {
      let formData = new URLSearchParams(new FormData(e.target));

      fetch("/library/modify/folder", {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          if (res.ok) {
            // folder was not moved so navigate back
            if (formData.get("move") === parent_id) {
              navigate(`/library?path=/${back}`);
            }
            // folder was moved so navigate to new location
            else navigate(`/library?path=${this.moveTo}`);
          }
          // load the error message
          else {
            res.json().then((data) => {
              // console.log(error);

              this.error = data.error;
            });
          }
        })
        .catch((e) => console.log(e));
    },

    setMoveTo(e) {
      this.moveTo = e.target.selectedOptions[0].getAttribute("t-move-to");
    },
  };
}
