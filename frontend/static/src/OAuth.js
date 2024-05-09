export function signIn() {

  const nonce =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  location.href = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id:
      "475371833305-s13of6hvbgfnp18u7fn9gotn7pgurrlc.apps.googleusercontent.com",
    redirect_uri: location.origin + location.pathname,
    response_type: "token id_token",
    scope: "profile email openid",
    state: "pass-through-value",
    nonce,
  })}`;
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000); // should redirect before resolution;
  })
}

export function logout() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    location.reload();
    return new Promise(resolve => setTimeout(() => resolve(true), 100));
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');

  return fetch("https://oauth2.googleapis.com/revoke?token=" + accessToken, {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
  })
    .finally(() => {
        location.reload();
    });
}

export const getJWT = () => {
  if (location.hash) {
    const searchParams = new URLSearchParams(location.hash);
    const idToken = searchParams.get("id_token");
    const accessToken = searchParams.get("access_token");

    localStorage.setItem("idToken", idToken);
    localStorage.setItem("accessToken", accessToken);

    // window.history.pushState({}, document.title, "/" + "index.html")

    return fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(data => {
        if (!data.ok) return null;
        return data.json();
      });
  } else {
    return new Promise((resolve) => {
      resolve(null);
    });
  }
};
