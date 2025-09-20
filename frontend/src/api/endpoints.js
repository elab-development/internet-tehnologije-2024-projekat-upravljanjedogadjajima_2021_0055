import http from "./http";

// pokuša /api/... pa fallback na /...
export async function postLogin(body) {
  try {
    return await http.post("/api/login", body);
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.post("/login", body);
    }
    throw e;
  }
}

export async function getMe() {
  try {
    return await http.get("/api/user");
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.get("/user");
    }
    throw e;
  }
}

export async function postLogout() {
  try {
    return await http.post("/api/logout");
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.post("/logout");
    }
    throw e;
  }
}