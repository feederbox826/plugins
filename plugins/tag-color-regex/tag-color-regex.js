(function () {
  'use strict'
  
  const parseConfig = () => {
    // getItem has no default argument: it returns null when no config was ever saved
    const config = localStorage.getItem("fbox-tag-color-regex-config") ?? "{}"
    try {
      return JSON.parse(config) ?? {}
    } catch {
      return {}
    }
  }
  
  const colorAll = () => wfke(".tag-item", () => {
    // pull config from localStorage
    const config = parseConfig()
    document.querySelectorAll(".tag-item").forEach(tag => {
      const sortName = tag["data-sort-name"]
      const tagName = tag.querySelector("a>div").textContent.trim()
      for (const [pattern, style] of Object.entries(config)) {
        const regex = new RegExp(pattern)
        if (regex.test(sortName) || regex.test(tagName)) {
          tag.style = style
          break
        }
      }
    })
  })
  
  PluginApi.Event.addEventListener("stash:location", () => colorAll())
  // gql findTag listener
  colorAll()
})()