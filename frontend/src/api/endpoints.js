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

export async function postRegister(body) {
  try {
    return await http.post("/api/register", body);
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.post("/register", body);
    }
    throw e;
  }
}

export async function getUsers() {
  try {
    return await http.get("/api/users");
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.get("/users");
    }
    throw e;
  }
}

export async function createUser(body) {
  try {
    return await http.post("/api/users", body);
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.post("/users", body);
    }
    throw e;
  }
}

export async function updateUser(id,body) {
  try {
    return await http.put(`/api/users/${id}`, body);
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.put(`/users/${id}`, body);
    }
    throw e;
  }
}

export async function deleteUser(id) {
  try {
    return await http.delete(`/api/users/${id}`);
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.delete(`/users/${id}`);
    }
    throw e;
  }
}