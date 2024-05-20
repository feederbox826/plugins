function addStudioImgBG() {
    // image dark/light detector from
    // https://stackoverflow.com/a/38213966
    // modified to exclude alpha pixels
    function queryBrightness(img) {
        let colorSum = 0;
        let alphaPixels = 0;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0);

        const data = ctx.getImageData(0,0,canvas.width,canvas.height).data
        for(let x = 0, len = data.length; x < len; x+=4) {
            if (data[x+3] === 0) {
                alphaPixels++
                continue; // skip transparent pixels
            }
            colorSum += Math.floor((data[x] + data[x+1] + data[x+2])/3); // average value of R, G and B
        }
        const alphaRatio = alphaPixels / (img.width*img.height)
        return [Math.floor(colorSum / ((img.width*img.height)-alphaPixels)), alphaRatio]
    }
    const selector = ".studio-overlay img.image-thumbnail:not(.checked), img.studio-logo:not(.checked), .studio-card-header img.studio-card-image:not(.checked)"
    const checkImage = (lookup, target) => {
        const [brightness, alphaRatio] = queryBrightness(lookup)
        target.classList.add("checked")
        target.classList.add(
            brightness >= 155 ? "light" // if over 155, it's light
                : brightness <= 110 ? "dark" // under 110, dark
                : "neutral" // leave neutral
        )
    }
    const checkImages = () => document.querySelectorAll(selector).forEach(img => {
        // clone image
        let newImage = new Image()
        newImage.src = img.src
        newImage.onload = () => {
            checkImage(newImage, img)
            newImage = null
        }
    })

    // toggle to dark mode if image is dark
    wfke(selector, checkImages)
    PluginApi.Event.addEventListener("stash:location", () => wfke(selector, checkImages))
}
addStudioImgBG()