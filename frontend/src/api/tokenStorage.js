const KEY_LS = "auth_token_ls"; // "remember me"
const KEY_SS = "auth_token_ss"; // session only

export const tokenStorage = {
  read() {
    return sessionStorage.getItem(KEY_SS) || localStorage.getItem(KEY_LS);
  },
  set(token, remember) {
    if (remember) {
      localStorage.setItem(KEY_LS, token);
      sessionStorage.removeItem(KEY_SS);
    } else {
      sessionStorage.setItem(KEY_SS, token);
      localStorage.removeItem(KEY_LS);
    }
  },
  clear() {
    localStorage.removeItem(KEY_LS);
    sessionStorage.removeItem(KEY_SS);
  },
};