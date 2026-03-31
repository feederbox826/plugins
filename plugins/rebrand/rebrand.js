async function nameSetter() {
    const configName = forbiddenConfig.root.configuration.ui.title
    const setNavbar = () => document.querySelector(".navbar-brand button").textContent = configName
    // change observer
    PluginApi.Event.addEventListener("stash:location", () => setNavbar())
    wfke(".navbar-brand button", setNavbar)
}
nameSetter()