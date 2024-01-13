(function () {
    // wait for visible key elements and return
    function wfke(selector, callback) {
        var el = document.querySelector(selector)
        if (el) return callback(el)
        setTimeout(wfke, 100, selector, callback)
    }
    'use strict'

    const tagImgSelector = ".detail-header-image img, .tag-card-header img"
    const bgImgSelector = ".background-image-container img"

    const waitImg = () => wfke(tagImgSelector, replaceAll)
    const replaceAll = () => document.querySelectorAll(`${tagImgSelector}, ${bgImgSelector}`).forEach(replace)

    function replace(img) {
        console.log("replacing")
        const src = img.getAttribute("src")
        const video = document.createElement("video")
        video.attributes.alt = img.attributes.alt
        video.classList = img.classList
        video.autoplay = true
        video.muted = true
        video.loop = true
        video.src = src
        video.poster = src
        video.setAttribute("playsinline", true)
        img.replaceWith(video)
    }
    stash.addEventListener('page:tag', waitImg)
    stash.addEventListener('page:tag:any', waitImg)
    stash.addEventListener('page:tags', waitImg)
})()