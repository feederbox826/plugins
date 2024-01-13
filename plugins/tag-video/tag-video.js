(function () {
    'use strict'
    // wait for visible key elements and return
    function wfke(selector, callback) {
        var el = document.querySelector(selector)
        if (el) return callback()
        setTimeout(wfke, 100, selector, callback)
    }

    const tagImgSelector = ".detail-header-image img, .tag-card-header img"
    const bgImgSelector = ".background-image-container img"

    const replaceAll = () => wfke(tagImgSelector, () =>
        document.querySelectorAll(`${tagImgSelector}, ${bgImgSelector}`)
            .forEach(replace)
    )

    function replace(img) {
        const src = img.getAttribute("src")
        const video = document.createElement("video")
        const propName = ["autoplay", "muted", "loop", "playsinline"]
        propName.forEach(prop => video[prop] = true)
        video.attributes.alt = img.attributes.alt
        video.classList = img.classList
        video.src = src
        video.poster = src
        img.replaceWith(video)
    }
    stash.addEventListener('page:tag', replaceAll)
    stash.addEventListener('page:tag:any', replaceAll)
    stash.addEventListener('page:tags', replaceAll)
    replaceAll()
})()