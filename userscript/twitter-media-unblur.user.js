// ==UserScript==
// @name         twitter-media-unblur
// @namespace    feederbox.cc
// @version      1.0
// @description  unblur all twitter sensitive media posts
// @author       feederbox826
// @match        https://twitter.com/*/media
// @icon         https://icons.duckduckgo.com/ip2/twitter.com.ico
// @grant        none
// ==/UserScript==

const selector = 'div[role="button"] > span'
const unhide = () => document.querySelectorAll(selector).forEach(e => e.click())
a
unhide()
document.addEventListener("scroll", unhide)