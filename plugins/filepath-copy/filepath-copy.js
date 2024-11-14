const hijackPathOpen = () => {
    const pathElem = document.querySelector('.scene-file-info a[href^="file://"]')
    pathElem.addEventListener("click", () => navigator.clipboard.writeText(pathElem.href))
}
PluginApi.Event.addEventListener("stash:location", (e) => {
    if (e.detail.data.location.pathname.startsWith("/scenes"))
        wfke(".scene-file-info", hijackPathOpen)
});
wfke(".scene-file-info", hijackPathOpen)