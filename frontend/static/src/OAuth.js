function signIn() {
  let oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
  let form = document.createElement("form");
  form.setAttribute("method", "GET");
  form.setAttribute("action", oauth2Endpoint);

  nonce =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  let params = {
    client_id:
      "475371833305-s13of6hvbgfnp18u7fn9gotn7pgurrlc.apps.googleusercontent.com",
    redirect_uri: "http://localhost:5500/index.html",
    //"redirect_uri":"http://localhost:63343/Spoder-Solitaire/index.html",
    response_type: "token id_token",
    scope: "profile email openid",
    state: "pass-through-value",
    nonce: nonce,
  };

  for (var p in params) {
    let input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", p);
    input.setAttribute("value", params[p]);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

function log() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    console.error("No access token found.");
    return;
  }

  fetch("https://oauth2.googleapis.com/revoke?token=" + accessToken, {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      if (response.ok) {
        console.log("Token revoked, redirecting...");
        location.href = "http://localhost:5500/login.html";
      } else {
        throw new Error("Failed to revoke token");
      }
    })
    .catch((error) => console.error("Error:", error));
}

const getJWT = () => {
  if (location.hash) {
    const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove the '#' and parse hash fragment
    const idToken = hashParams.get("id_token");
    console.log("User ID token:", idToken);

    const accessToken = hashParams.get("access_token");
    console.log("Access token:", accessToken);

    localStorage.setItem("idToken", idToken);
    localStorage.setItem("accessToken", accessToken);

    // window.history.pushState({}, document.title, "/" + "index.html")

    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((data) => data.json())
      .then((info) => {
        console.log(info);
        console.log(info.name);
        nameParts = info.name.split(" ");
        firstName = nameParts[0];
        parts = info.email.split("@");
        userID = parts[0];
        console.log(userID);

        let nameTag = document.querySelector(".title");

        if (nameTag) {
          nameTag.innerHTML = `${firstName}'s game of Spider`;
        } else {
          console.log("Title element not found");
        }
      });
  } else {
    console.log("No hash fragment found in location.hash");
  }
};
