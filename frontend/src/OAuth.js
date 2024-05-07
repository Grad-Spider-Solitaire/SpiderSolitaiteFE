function signIn(){
    let oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth"
    let form = document.createElement('form')
    form.setAttribute('method', 'GET');
    form.setAttribute('action', oauth2Endpoint)

    nonce =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    let params = {
        "client_id": "475371833305-s13of6hvbgfnp18u7fn9gotn7pgurrlc.apps.googleusercontent.com",
        "redirect_uri": "http://localhost:5500/index.html",
        //"redirect_uri":"http://localhost:63343/Spoder-Solitaire/index.html",
        "response_type":"token id_token",
        "scope":"profile",
        "state":"pass-through-value",
        "nonce":nonce
    }

    for(var p in params){
       let input = document.createElement('input')
       input.setAttribute('type','hidden')
       input.setAttribute('name',p)
       input.setAttribute('value',params[p])
       form.appendChild(input)
    }
    document.body.appendChild(form)
    form.submit()
}