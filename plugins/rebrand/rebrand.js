// wait for visible key elements
function wfke(selector, callback) {
    var el = document.querySelector(selector);
    if (el) return callback();
    setTimeout(wfke, 100, selector, callback);
}
async function main() {
    const configName = forbiddenConfig.getPluginSetting("rebrand", "name", "Stash")
    const setNavbar = () =>document.querySelector(".navbar-brand button").textContent = configName
    function replaceName() {
        const oldName = document.title;
        // check for temporary stash name
        if (oldName == 'Stash' && window.location.pathname !== '/') return;
        // check for and replace with custom name
        const newName = oldName.replace('Stash', configName);
        if (oldName !== newName) document.title = newName;
    }
    function initialSet() {
        setNavbar()
        replaceName()
    }
    // change observer
    PluginApi.Event.addEventListener("stash:location", () => replaceName())
    wfke(".navbar-brand button", initialSet)
}
main()