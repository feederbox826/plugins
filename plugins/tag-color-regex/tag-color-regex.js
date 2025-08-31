(function () {
  'use strict'
  
  const parseConfig = () => {
    const config = localStorage.getItem("fbox-tag-color-regex-config", "{}")
    const parsedConfig = JSON.parse(config)
    return parsedConfig
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