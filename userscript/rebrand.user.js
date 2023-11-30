// ==UserScript==
// @name         stash-rebrand
// @namespace    feederbox826
// @version      0.1
// @description  rename stash instance to custom text
// @author       feederbox826
// @match        http://localhost:9999/*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(async function() {
    'use strict'
    //const configName = await stash.getConfigValueTask('rename-stash', 'name')
    const configName = "my porn stash"
    function wfke(selector, callback) {
        var el = document.querySelector(selector);
        if (el) return callback(el);
        setTimeout(wfke, 100, selector, callback);
    }
    function setNavbar() {
        const target = document.querySelector(".navbar-brand button")
        target.textContent = configName
    }
    function replaceName() {
        console.log("navigated")
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
    wfke(".navbar-brand button", initialSet)
})();