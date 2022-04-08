import navigate from "../utils/navigate.js";

export default function addImageForm(path, _csrf) {
  return {
    imageData: "",
    error: "",
    path,
    _csrf,

    fileChosen(event) {
      this.fileToDataUrl(event, (src) => (this.imageData = src));
    },

    fileToDataUrl(event, callback) {
      if (!event.target.files.length) return;

      let file = event.target.files[0];
      let reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (e) => callback(e.target.result);
    },

    submit(event) {
      let formData = new FormData(event.target);

      fetch(`/library/image?path=${this.path}`, {
        method: "POST",
        headers: { "csrf-token": this._csrf },
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
