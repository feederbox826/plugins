async function rebrandSetter() {
    const configName = forbiddenConfig.getPluginSetting("rebrand", "name", "Stash")
    const setNavbar = () =>document.querySelector(".navbar-brand button").textContent = configName
    // override setter
    const originalSetter = (newTitle) => Object.getOwnPropertyDescriptor(Document.prototype, 'title').set.call(document, newTitle)
    function newSetter (newName) {
        newName = newName
            .replace(/^Stash$/, configName)
            .replace(/ \| Stash/, ` | ${configName}`)
        originalSetter(newName)
    }
    Object.defineProperty(document, "title", {
        set: newSetter
    })
    // change observer
    PluginApi.Event.addEventListener("stash:location", () => setNavbar())
    wfke(".navbar-brand button", setNavbar)
}
rebrandSetter()