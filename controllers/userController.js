const getUser = (username, password) => {
  if (username === "tamanoir" && password === "mot_de_passe") {
    return {
      username: "tamanoir",
      id: 1,
    };
  } else {
    return false;
  }
};

export { getUser };
