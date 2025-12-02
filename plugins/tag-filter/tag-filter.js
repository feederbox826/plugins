// load metatags for gql intercept
const refreshTags = () => JSON.parse(localStorage.getItem("tag-filter-metatags")) || []

// add graphql intercept
const tagSearchInterceptor = async (data, query) => {
    const metatags = refreshTags()
    // check that we are doing findTags query
    if (!data?.data?.findTags) return data
    // check our request
    if (query?.operationName !== "FindTagsForSelect") return data
    // check current url
    if (location.pathname.startsWith("/tags")) return data
    // keep track of count for modifying
    // filter out tags in our meta-tag list
    const newTagList = data.data.findTags.tags.filter(tag => !metatags.includes(tag.id))
    const newLength = newTagList.length
    // modify tags and count
    data.data.findTags.tags = newTagList
    data.data.findTags.count = newLength
    return data
}

const filterSceneTags = (scene) => {
    const metatags = refreshTags()
    scene.tags = scene.tags.filter(tag => !metatags.includes(tag.stored_id))
    return scene
}

// add scraper intercept
const scraperIntercept = async (data, query) => {
    const hideScrape = forbiddenConfig.getPluginSetting("tag-filter", "hideScrape", false)
    if (!hideScrape) return data
    // filter requests
    const scrapeType = Object.keys(data.data)[0]
    if (!["scrapeSingleScene", "scrapeMultiScenes"].includes(scrapeType)) return data
    const newScenes = data.data[scrapeType].map(scene => filterSceneTags(scene))
    data.data[scrapeType] = newScenes
    return data
}

window.fbox826.interceptors.push(tagSearchInterceptor)
window.fbox826.interceptors.push(scraperIntercept)

// add tag UI
function tagFilterUI() {
    const waitAdd = () => {
        wfke("#tag-edit", addToggle)
        wfke("#tag-page", addIcon)
    }
    const toggleTag = (tagid, state) => {
        const metatags = refreshTags()
        state ? metatags.push(tagid)
            : metatags.splice(metatags.indexOf(tagid), 1)
        localStorage.setItem("tag-filter-metatags", JSON.stringify(metatags))
    }

    function addIcon() {
        if (document.querySelector(".tag-filter-icon")) return
        const tagid = (new URL(document.URL).pathname).split("/")[2]
        if (!refreshTags().includes(tagid)) return
        const icon = document.createElement("i")
        icon.classList = "fa-solid fa-brain tag-filter-icon"
        document.querySelector(".name-icons").appendChild(icon)
    }

    function addToggle() {
        let tagid = (new URL(document.URL).pathname).split("/")[2]
        // handle click
        const clickToggle = (e) => toggleTag(tagid, e.target.checked)

        const id = "tag-filter-toggle"
        if (document.getElementById(id)) return
        const parent = document.createElement("div")
        parent.classList = "custom-control custom-switch"
        const checkbox = document.createElement("input")
        checkbox.classList = "custom-control-input"
        checkbox.type = "checkbox"
        checkbox.id = id
        parent.append(checkbox)
        checkbox.onclick = clickToggle
        const label = document.createElement("label")
        label.classList = "custom-control-label"
        label.htmlFor = id
        label.innerText = "Hide tag in scene search"
        parent.append(label)
        // pre-check if tag is in list
        checkbox.checked = refreshTags().includes(tagid)
        document.querySelector("#tag-edit").appendChild(parent)
    }

    PluginApi.Event.addEventListener("stash:location", (e) => {
        if (e.detail.data.location.pathname.startsWith("/tags")) waitAdd()
    })
    // gql findTag listener
    waitAdd()
}
tagFilterUI()