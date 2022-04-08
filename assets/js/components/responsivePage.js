import navigate from "../utils/navigate.js";

export default function responsivePage() {
  window.onpopstate = (e) => navigate(e.state.location, true);

  return {
    navigate,
  };
}
