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
      const doc = new DOMParser().parseFromString(text, "text/html");
      document.body.innerHTML = doc.body.innerHTML;

      if (fromPopState) return;

      let old_location = document.location.pathname + document.location.search;
      window.history.replaceState({ location: old_location }, "", old_location);
      window.history.pushState({ location: url }, "", url);
    })
    .catch((e) => console.log(e));
}

function modifyFolderForm() {
  return {
    submit(e, back) {
      let formData = new URLSearchParams(new FormData(e.target));

      console.log(formData.get("_csrf"));

      fetch("/library/modify/folder", {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          console.log(res);

          return;

          if (res.ok) {
            navigate(`/library?path=/${back}`);
          }
        })
        .catch((e) => console.log(e));
    },
  };
}
