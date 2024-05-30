// load metatags for gql intercept
const refreshTags = () => JSON.parse(localStorage.getItem("tag-filter-metatags")) || []
const metatags = refreshTags()

// add graphql intercept
const tagSearchInterceptor = async (data, query) => {
    // check that we are doing findTags query
    if (!data?.data?.findTags) return data
    // check our request
    if (query?.operationName !== "FindTagsForSelect") return data
    // keep track of count for modifying
    const removedCount = 0
    // filter out tags in our meta-tag list
    const newTagList = data.data.findTags.tags.filter(tag => {
        if (metatags.includes(tag.id)) {
            removedCount++
            return false
        }
        return true
    })
    // modify responses
    data.data.findTags.tags = newTagList
    // modify count
    data.data.findTags.count -= removedCount
    return data
}

window.fbox826.interceptors.push(tagSearchInterceptor)

// add tag UI
function tagFilterUI() {
    const addButton = () => wfke("#tag-page .detail-container", addToggle)
    const toggleTag = (tagid, state) => {
        const metatags = refreshTags()
        state ? metatags.push(tagid)
            : metatags.splice(metatags.indexOf(tagid), 1)
        localStorage.setItem("tag-filter-metatags", JSON.stringify(metatags))
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
        // remove `.studio-head.col` for v25 release
        document.querySelector("#tag-page .studio-head.col, #tag-page .tag-head.col").append(parent)
    }

    PluginApi.Event.addEventListener("stash:location", (e) => {
        if (e.detail.data.location.pathname.startsWith("/tags")) addButton()
    })
    // gql findTag listener
    addButton()
}
tagFilterUI()