function custom_filepath() {
  const config = forbiddenConfig.pluginSettings['custom-filepath'] || {}
  
  const transformPath = (input) => {
    // 1. run regex replacements
    // 2. strip prefix
    // 3. add prefix
    // 4. check if we are adding url
    //  add space encode
    //  add prefix
    const spaceEncode = config?.uriSpaceReplacement ?? "%20"

    // strip prefix
    input = input.replace(config?.pathPrefixStrip ?? "", config.pathPrefixAdd ?? "")

    if (config?.regexPattern) {
      input = input.replace(new RegExp(config.regexPattern, "g"), config?.regexReplace ?? "")
    }
    if (config?.uriPrefix) {
      input = config.uriPrefix + input.replace(/ /g, spaceEncode)
    }
    return input
  }

  const hijackPath = () => {
    const pathElem = document.querySelectorAll(".scene-file-info>dd>span>div")
    // iterate over elements
    for (const elem of [...pathElem]) {
      if (elem.dataset?.['custom-filepath']) return // already transformed
      const path = elem?.textContent
      const newPath = transformPath(path)
      // check if URI
      if (config?.uriPrefix) {
        const linkElem = document.createElement("a")
        linkElem.href = newPath
        linkElem.textContent = newPath
        linkElem.classList.add("TruncatedText")
        linkElem.style = "-webkit-line-clamp: 1;"
        linkElem.target = "_blank"
        elem.replaceWith(linkElem)
      } else {
        elem.textContent = newPath
        // mark as transformed
        elem.setAttribute("data-custom-filepath", "")
      }
    }
  }
  PluginApi.Event.addEventListener("stash:location", (e) => {
    if (e.detail.data.location.pathname.startsWith("/scenes"))
      wfke(".scene-file-info", hijackPath)
  });
  wfke(".scene-file-info", hijackPath)
}
custom_filepath()