// ==UserScript==
// @name         db-noto-color
// @namespace    feederbox826
// @version      0.1
// @description  Adds Noto Color Emoji to stash instances
// @author       feederbox826
// @match        https://fansdb.cc/*
// @match        https://stashdb.org/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(`
@import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');
font-family: 'Noto Color Emoji', sans-serif;
`);