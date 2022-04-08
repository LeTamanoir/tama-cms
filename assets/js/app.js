import Alpine from "alpinejs";
import nProgress from "nprogress";
import responsivePage from "./components/responsivePage.js";
import addFolderForm from "./components/addFolderForm.js";
import manageAlert from "./components/manageAlert.js";
import modifyFolderForm from "./components/modifyFolderForm.js";
import movableGrid from "./components/movableGrid.js";
import addImageForm from "./components/addImageForm.js";
import modifyImageForm from "./components/modifyImageForm.js";

nProgress.configure({
  showSpinner: false,
});
window.addEventListener("page:fetch", () => nProgress.start());
window.addEventListener("page:change", () => nProgress.done());

window.Alpine = Alpine;

Alpine.data("responsivePage", responsivePage);
Alpine.data("manageAlert", manageAlert);
Alpine.data("movableGrid", movableGrid);

Alpine.data("addFolderForm", addFolderForm);
Alpine.data("modifyFolderForm", modifyFolderForm);

Alpine.data("addImageForm", addImageForm);
Alpine.data("modifyImageForm", modifyImageForm);

Alpine.start();
