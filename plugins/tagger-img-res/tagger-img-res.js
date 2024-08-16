const tryAddRes = (img) =>
    !img.complete
        ? img.onload = evt => addRes(evt.target)
        : addRes(img)

function addRes(img) {
    if (img.dataset.setresolution) return
    img.dataset.setresolution = true
    // create element for resolution
    const resBox = document.createElement("span")
    resBox.classList = "tagger-img-res"
    const [bg, fg] = colorScale(img.naturalHeight)
    resBox.style.backgroundColor = bg
    resBox.style.color = fg
    resBox.textContent = commonHeight(img.naturalWidth, img.naturalHeight)
    img.after(resBox)
    img.parentElement.style.position = "relative"
}

const commonRes = {
    "16K": [15360, 8640],
    "8K": [7680, 4320],
    "6K": [5760, 3240],
    "5K": [5120, 2880],
    "4K": [3840, 2160],
    "1800p": [3200, 1800],
    "1440p": [2560, 1440],
    "1080p": [1920, 1080],
    "900p": [1600, 900],
    "720p": [1280, 720],
    "540p": [960, 540],
    "480p": [720, 480],
    "480p": [640, 480]
}

const commonHeight = (width, height) => {
    const THRESHOLD = 30
    for (const [res, [w, h]] of Object.entries(commonRes)) {
        // within +-THRESHOLD px
        if (width > (w-THRESHOLD) && width < (w+THRESHOLD)
            && height > (h-THRESHOLD) && height < (h+THRESHOLD)) {
          return res
        }
    }
    return `${width} x ${height}`
}

const colorScale = (height) =>
    // amazing
    height > 8640 ? ["#cd0065", "#eee"]
        : height == 8640 ? ["#9b00c9", "#eee"]
        : height >= 4320 ? ["#9c18fb", "#eee"]
        // great
        : height >= 2160 ? ["#076dbe", "#eee"]
        // good
        : height >= 1800 ? ["#008115", "#eee"]
        : height >= 1440 ? ["#00b155", "#111"]
        // above avg
        : height >= 900 ? ["#8fd259", "#111"]
        // average
        : height >= 720 ? ["#dde12e", "#111"]
        // bad
        : height >= 540 ? ["#ff9c1f", "#111"]
        : height >= 480 ? ["#cd0a06", "#eee"]
        : ["#810402", "#eee"]

const addAllRes = () => document.querySelectorAll(".tagger-container img.scene-card-preview-image, .tagger-container img.scene-image, .SceneScrapeModal img.scene-image, .scrape-dialog img.scene-cover").forEach(img => tryAddRes(img))

// mutation observer for new images
new MutationObserver(() => {
    addAllRes()
}).observe(
    document,
    { childList: true, subtree: true },
);
addAllRes()