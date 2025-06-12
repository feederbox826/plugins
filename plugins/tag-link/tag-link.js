function tagLink() {
  // idb handler
  const customStore = idbKeyval.createStore('fbox826', 'tag-link')
  // get forbidden config
  const ALLOW_REMOTE = forbiddenConfig.getPluginSetting("tag-link", "allowremote", false)
  const PRE_POPULATE = forbiddenConfig.getPluginSetting("tag-link", "prepopulate", false)

  // fetch from feederbox
  const TAGS_EXPORT_URL = "https://tags.feederbox.cc/tags-export.json"
  const findTagFbox = (tagName) =>
    fetch(TAGS_EXPORT_URL)
      .then(response => response.json())
      .then(data => data?.[tagName]?.stashID)

  // fetch from stashdb
  const findTagStashDB = (tagName) =>
    stashdb.callGQL({
      query: `query ($tagName: String) { findTag(name: $tagName) { id deleted }}`,
      variables: { tagName }
    // return null if deleted
    }).then(results => results.findTag?.deleted ? null : results.findTag?.id)

  // if external is allowed, fetch and populate all tags
  async function populateFboxTags() {
    const tag_pairs = await fetch(TAGS_EXPORT_URL)
      .then(res => res.json())
      .then(data => Object.entries(data)
        .filter(([_, value]) => value?.stashID)
        .map(([key, value]) => ([ key, value.stashID ]))
      )
    idbKeyval.setMany(tag_pairs, customStore)
  }

  if (ALLOW_REMOTE && PRE_POPULATE) {
    console.log("Pre-populating tags from feederbox...")
    populateFboxTags()
      .catch(err => console.error("Error pre-populating tags:", err))
  }

  // return from feederbox if allowed, otherwise from stashdb
  const fetchTag = async (tagName) => {
    if (ALLOW_REMOTE && !PRE_POPULATE) {
      console.log(`Fetching tag "${tagName}" from feederbox...`)
      const fbox = await findTagFbox(tagName)
      if (fbox) return fbox
    }
    return findTagStashDB(tagName)
  }

  const getTag = async (tagName) => {
    // fetch from idb if possible
    const local = await idbKeyval.get(tagName, customStore)
    if (local) return local
    // otherwise fetch from external
    const externalTag = await fetchTag(tagName)
    if (externalTag) {
      console.log(`Tag "${tagName}" found with id: ${externalTag}`)
      idbKeyval.set(tagName, externalTag, customStore)
      return externalTag
    }
    return null
  }

  function addLinkElem(id) {
    if (document.querySelector(".tag-link")) return
    // create element to mimic external link
    const linkParent = document.createElement("a")
    linkParent.classList = "tag-link external-links-button dropdown"
    linkParent.href = `https://stashdb.org/tags/${id}`
    linkParent.target = "_blank"
    linkParent.rel = "noopener noreferrer"
    linkParent.title = "View on StashDB"
    const linkButton = document.createElement("button")
    linkButton.classList = "minimal link dropdown-toggle btn btn-primary"
    linkButton.type = "button"
    const linkIcon = document.createElement("i")
    linkIcon.classList = "fa-solid fa-link"
    linkButton.appendChild(linkIcon)
    linkParent.appendChild(linkButton)
    // append to favourite button
    const favButton = document.querySelector(".favorite-button")
    favButton.after(linkParent)
  }
  // set ratings
  async function addLink() {
    if (!document.querySelector("#tag-page")) return
    if (document.querySelector(".tag-link")) return
    const tagName = document.querySelector(".tag-name").textContent.trim()
    const tagId = await getTag(tagName)
    if (!tagId) {
      console.log(`Tag "${tagName}" not found in stashdb or feederbox.`)
      return
    }
    // add link element
    addLinkElem(tagId)
  }
  // change observer
  PluginApi.Event.addEventListener("stash:location", () => addLink())
  wfke(".favorite-button", addLink)
  console.log("Tag Link plugin initialized.")
}
tagLink()