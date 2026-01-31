import { auth } from "../Firebase/config.js";
import handleRedirect from "../handler/handleRedirect.js";

const checkUser = () => {
  Swal.fire({
    title: "Please Wait!",
    text: "Please Wait A Moment.",
    // toast: true,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
  auth.onAuthStateChanged((user) => {
    if (user) {
      handleRedirect(user.uid);
    }
    Swal.close();
  });
};

export default checkUser;
