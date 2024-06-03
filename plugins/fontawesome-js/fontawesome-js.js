function createSVG (library, name, initiator) {
    const faName = findSVG(name)
    const libraryName = library === "regular" ? "FontAwesomeRegular" : "FontAwesomeSolid"
    const icon = PluginApi.libraries[libraryName]?.[faName]?.icon
    if (!icon) return
    // create svg
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("role", "img")
    svg.classList = `svg-inline--fa fa-icon ${initiator.classList}`
    svg.setAttribute("viewBox", `0 0 ${icon[0]} ${icon[1]}`)
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor")
    path.setAttribute("d", icon[4])
    svg.append(path)
    return svg
}

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

function findSVG (name) {
    const iconNameArr = name.split("-")
    iconNameArr.shift()
    return `fa${iconNameArr.map(capitalize).join("")}`
}

const searcher = () => {
    document.querySelectorAll("i").forEach(icon => {
        // extract classes
        const classes = icon.classList.value.split(" ")
        // check if fa-regular or fa-solid
        const library = classes.includes("fa-regular") ? "regular" : "solid"
        // get fa-icon name
        const name = classes.find(c => c.startsWith("fa-")
            && c !== "fa-regular" && c !== "fa-solid")
        if (!name) return
        // create svg
        const svg = createSVG(library, name, icon)
        // replace if valid
        if (svg) icon.replaceWith(svg)
    })
}

const mutationCallback = (mutationList) => {
    for (const mutation of mutationList) {
        if (mutation.type === "childList") searcher()
    }
}

const observer = new MutationObserver(mutationCallback)

observer.observe(document.body, { childList: true, subtree: true })
PluginApi.Event.addEventListener("stash:location", () => searcher())
document.addEventListener("DOMContentLoaded", () => searcher())