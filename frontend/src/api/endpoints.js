import http from "./http";

// Ovo su primeri API poziva, gde hvatamo gresku 404 i ponovo pokusavamo bez /api prefiksa

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

export async function getEventsByUser(userId) {
  // dozvoli da stigne i objekat, izvuci id
  const id = Number(userId?.id ?? userId);
  if (!Number.isFinite(id)) throw new Error("Invalid userId for getEventsByUser");

  try {
    return await http.get("/api/events", { params: { user_id: id, per_page: 100 } });
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.get("/events", { params: { user_id: id } });
    }
    throw e;
  }
}


export async function getEvents() {
  try {
    return await http.get("/api/events");
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.get("/events");
    }
    throw e;
  }
}

export async function createEvent(body) {
  try {
    return await http.post("/api/events", body);
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.post("/events", body);
    }
    throw e;
  }
}

export async function getCategories() {
  try {
    return await http.get("/api/categories");
  } catch (e) {
    if (e?.response?.status === 404) {
      return await http.get("/categories");
    }
    throw e;
  }
}