function addStudioImgBG() {
    // image dark/light detector from
    // https://stackoverflow.com/a/38213966
    // modified to exclude alpha pixels
    function queryBrightness(dims, img) {
        let colorSum = 0;
        let alphaPixels = 0;
        const canvas = document.createElement("canvas");
        const width = dims[0]
        const height = dims[1]
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0);

        const data = ctx.getImageData(0,0,width,height).data
        for(let x = 0, len = data.length; x < len; x+=4) {
            if (data[x+3] === 0) {
                alphaPixels++
                continue; // skip transparent pixels
            }
            colorSum += Math.floor((data[x] + data[x+1] + data[x+2])/3); // average value of R, G and B
        }
        const alphaRatio = alphaPixels / (width*height)
        return [Math.floor(colorSum / ((width*height)-alphaPixels)), alphaRatio]
    }
    const selector = ".studio-overlay img.image-thumbnail:not(.checked), img.studio-logo:not(.checked), .studio-card-header img.studio-card-image:not(.checked)"
    const targetDimensions = async (target) => {
        const height = target.height || target.clientHeight
        const width = target.width || target.clientWidth
        if (height && width) return [height, width]
        else if (!height && !width) {
            // inject svg
            const dims = await fetch(target.src)
                .then(res => res.text())
                .then(data => {
                    const ct = document.createElement("svg")
                    ct.innerHTML = data
                    const vbox = ct.children[0].getAttribute("viewBox")
                    delete ct
                    return vbox
                })
            const [,,width, height] = dims.split(" ")
            return [width, height]
        }
    }
    const checkImage = async (lookup, target) => {
        // get dimensions
        const dims = await targetDimensions(lookup)
        const [brightness, alphaRatio] = queryBrightness(dims, target)
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
    PluginApi.Event.addEventListener("stash:location", () => {
        document.querySelectorAll(".studio-logo.checked").forEach(img => img.classList.remove("checked", "light", "dark", "neutral"))
        wfke(selector, checkImages)
    })
}
addStudioImgBG()