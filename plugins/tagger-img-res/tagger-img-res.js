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

const commonHeight = (width, height) =>
    height == 8640 && width == 15360 ? "16K"
    : height == 4320 && width == 7680 ? "8K"
    : height == 2160 && width == 3840 ? "4K"
    : height == 1800 && width == 3200 ? "1800p"
    : height == 1440 && width == 2560 ? "1440p"
    : height == 1080 && width == 1920 ? "1080p"
    : height == 720 && width == 1280 ? "720p"
    : height == 540 && width == 960 ? "540p"
    : height == 480 && width == 720 ? "480p"
    : `${width} x ${height}`

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
        : height >= 1080 ? ["#8fd259", "#111"]
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