function correctURL(url) {
    let newurl = url
    // if no protocol, add https
    if (!newurl.startsWith("http")) newurl = "http://" + newurl
    // if does not end with /, add it
    if (!newurl.endsWith("/")) newurl += "/"
    // add graphql endpoint
    if (!newurl.endsWith("graphql")) newurl += "graphql"
    return newurl
}

const errToast = (message) => {
    Toastify({
        text: message,
        duration: 10000,
        style: { background: "red" }
    }).showToast()
}

function populateRemote() {
    // get apiKey and remote path
    const currentURL = new URL(window.location.href).origin
    const rawURL = window.forbiddenConfig.getPluginSetting("stash-open", "stashurl", currentURL)
    const stashurl = correctURL(rawURL)
    // parse paths
    const pathList = window.forbiddenConfig.getPluginSetting("stash-open", "pathreplace", "")
    let paths = pathList ? pathList.trim().split(" ").map(p => p.split(',')) : undefined
    // check if server is alive
    fetch ("http://localhost:19999/health")
        .catch(err => errToast(`error connecting to Stash-Open Server ${err}`))
    // create config object
    const config = {
        stashurl,
        stashapikey: window.forbiddenConfig.gqlKey,
        paths
    }
    // send config to server
    fetch("http://localhost:19999/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
    }).catch(err => errToast(`error connecting to Stash-Open Server ${err}`))
}

function hijackPathOpen() {
    const pathElem = document.querySelector('.scene-file-info a[href^="file://"]')
    const sceneID = window.location.pathname.split("/")[2]
    pathElem.onclick = (e) => {
        e.preventDefault()
        fetch(`http://localhost:19999/open/${sceneID}`)
    }
};
PluginApi.Event.addEventListener("stash:location", (e) => {
    if (e.detail.data.location.pathname.startsWith("/scenes"))
        wfke(".scene-file-info", hijackPathOpen)
});
populateRemote()
wfke(".scene-file-info", hijackPathOpen)
