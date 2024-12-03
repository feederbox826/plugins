// get VR tag name from forbiddenConfig

const vrTagName = window.forbiddenConfig.root.configuration.ui.vrTag;
const defaultProjection = window.forbiddenConfig.getPluginSetting("autovr", "defaultProjection", "180_LR");

const vr180Tags = new Set([
    "180°","180","180 FOV","180 VR","180VR","180° FOV","180° VR","FOV: 180","FOV: 180°","FOV:180","FOV:180°","VR 180","VR180",
    "190°","190","RF52",
    "200","200°",
    "220","220°"
])
const vr360Tags = new Set(["360°", "360"])
const validProjections = new Set(["180_LR", "Sphere", "360_TB"])

document.addEventListener("vjs-shortcut:ready", (event) => {
    var projection = null;
    const player = event.detail.player;
    // wait for tags before setting
    const setPlayer = () => {
        // if defaultProjection is sphere, set to sphere since it's compatible with both
        const projectionChoice = (defaultProjection == "Sphere") ? "Sphere" : projection ?? defaultProjection
        console.log(`[autovr] found tag ${projection}, setting to ${projectionChoice}`)
        player.vr().currentProjection_ = projectionChoice
    }
    const checkTags = () => {
        // get all tags
        const tags = [...document.querySelectorAll(".tag-item>a>div")];
        // iterate over tags
        let isVR = false;
        for (const tag of tags) {
            if (vr180Tags.has(tag.textContent)) projection = "180_LR";
            else if (vr360Tags.has(tag.textContent)) projection = "360_LR";
            else if (tag.textContent == vrTagName) isVR = true;
            if (isVR && projection) break; // break early if both are met
        }
        if (isVR || projection) setPlayer()
    }
    wfke(".tag-item", checkTags)
    // validate projection
    if (!validProjections.has(defaultProjection)) {
        console.error("Invalid default projection setting, defaulting to 180_LR");
        defaultProjection = "180_LR";
    }
})