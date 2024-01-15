(async function() {
    'use strict'
    const configName = await stash.getConfigValue('rebrand', 'name', "Stash")
    function setNavbar() {
        const target = document.querySelector(".navbar-brand button")
        target.textContent = configName
    }
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
    new MutationObserver(() => {
        replaceName()
    }).observe(
        document.querySelector('title'),
        { childList: true }
    );
    waitForElementBySelector(".navbar-brand button", initialSet)
})();