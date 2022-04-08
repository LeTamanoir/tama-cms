export default function manageAlert() {
  return {
    show: false,
    show_styles: false,
    title: "",
    content: "",
    callback: () => {},

    showAlert(e) {
      this.show_styles = true;
      this.title = e.detail.title;
      this.content = e.detail.content;
      this.callback = e.detail.callback;

      window.setTimeout(() => {
        this.show = true;
      }, 100);
    },

    clearAlert() {
      this.show = false;

      window.setTimeout(() => {
        this.show_styles = false;
        this.title = "";
        this.content = "";
      }, 100);
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
