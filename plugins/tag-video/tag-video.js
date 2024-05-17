(function () {
    'use strict'

    const delay = ms => new Promise(res => setTimeout(res, ms))
    const tagImgSelector = ".detail-header-image > img:not([placeholder]), .tag-card-header > img:not([placeholder])"
    const bgImgSelector = ".background-image-container > img:not([placeholder])"

    const replaceAll = () => wfke(tagImgSelector, () => {
        document.querySelectorAll(tagImgSelector)
            .forEach(img => replace(img, true))
        document.querySelectorAll(bgImgSelector)
            .forEach(replace)
    })

    const intervalReplaceAll = () => setInterval(replaceAll, 500)

    async function playVideo(evt) {
        const checkHover = () => (!video.matches(':hover')) ? stopVideo(evt) : true
        const video = evt.target
        await delay(100)
        if (!checkHover()) return
        video.muted = false
        video.currentTime = 0
        video.play()
            .then(() => setInterval(checkHover, 100))
            .catch(err => {})
    }

    const stopVideo = (evt) => evt.target.muted = true

    function replace(img, hover = false) {
        const src = img.getAttribute("src")
        const video = document.createElement("video")
        const propName = ["autoplay", "muted", "loop", "playsinline"]
        propName.forEach(prop => video[prop] = true)
        video.attributes.alt = img.attributes.alt
        video.classList = img.classList
        video.classList.add("tag-video")
        video.disableRemotePlayback = true
        video.src = src
        video.poster = src
        if (hover) {
            video.addEventListener('mouseover', playVideo)
            video.addEventListener('mouseout', stopVideo)
        }
        img.replaceWith(video)
        // add a hidden child img for tag-cropper
        const imgChild = document.createElement("img")
        imgChild.src = src
        imgChild.style.display = "none"
        imgChild.setAttribute("placeholder", "")
        imgChild.classList = img.classList
        video.after(imgChild)
    }
    const pathSwitcher = (event) => {
        const path = event.detail.data.location.pathname
        if (path == "/tags") replaceAll()
        else if (path.startsWith("/tags")) intervalReplaceAll()

    }
    PluginApi.Event.addEventListener("stash:location", pathSwitcher)
    replaceAll()
})()