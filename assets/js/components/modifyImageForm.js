import Cropper from "cropperjs";
import navigate from "../utils/navigate.js";

export default function modifyImageForm({
  back,
  _csrf,
  cropper_src,
  ratio,
  resize_height,
  resize_width,
}) {
  return {
    back,
    _csrf,
    cropper_src,
    moved: false,
    renamed: false,
    error: "",
    cropper_show: false,
    cropper: null,
    image_blob: null,
    image_preview: "",
    resize_show: false,
    resize_height,
    resize_width,
    ratio,

    showCropper() {
      this.cropper = new Cropper(this.$refs.cropper, { viewMode: 1 });
      const { height, width } = this.cropper.getImageData();
      this.cropper.setCropBoxData({ top: 0, left: 0, width, height });
    },

    cropImage() {
      this.cropper.getCroppedCanvas().toBlob(
        (blob) => {
          this.image_blob = blob;

          let reader = new FileReader();

          reader.readAsDataURL(blob);
          reader.onload = (e) => {
            this.image_preview = e.target.result;

            this.cropper.destroy();
            this.cropper = null;
            this.cropper_show = false;
          };
        },
        "image/jpeg",
        0.9
      );
    },

    fitImage() {
      const { height, width } = this.cropper.getImageData();
      this.cropper.setCropBoxData({
        top: 0,
        left: 0,
        width,
        height,
      });
    },

    submit(e) {
      let formData = new FormData(e.target);

      if (this.image_blob) {
        formData.append("image", this.image_blob);
      } else {
        formData = new URLSearchParams(formData);
      }

      fetch(
        `/library/image${
          this.image_blob ? "/crop" : this.resize_show ? "/resize" : ""
        }`,
        {
          method: "PUT",
          headers: { "csrf-token": this._csrf },
          body: formData,
        }
      )
        .then((res) => {
          if (res.ok) {
            navigate(`/library?path=${this.back}`);
          } else {
            res.json().then((data) => {
              this.error = data.error;

              window.setInterval(() => {
                this.error = "";
              }, 5000);
            });
          }
        })
        .catch((e) => console.log(e));
    },
  };
}
