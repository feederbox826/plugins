function addSkipIntroIndicator() {
  const getStudioInfo = async (id) => csLib.callGQL({
    query: `query ($id: ID!) {
    findStudio(id: $id) {
      custom_fields
      stash_ids { stash_id endpoint }
      parent_studio {
        custom_fields
        stash_ids { stash_id endpoint }
      }
    }}`,
    variables: { id }
  }).then(data => data.findStudio)

  const addPopover = (text, type, target) => {
    // check for existing
    if (target.querySelector(`.skip-intro-popover`)) return;
    const popovers = target.querySelector(".card-popovers")
    const container = document.createElement("a")
    const button = document.createElement("button")
    button.classList.add("minimal", "btn", "btn-primary", "skip-intro-popover")
    const icon = document.createElement("i")
    icon.classList.add("fa-solid", type)
    button.appendChild(icon)
    const textSpan = document.createElement("span")
    textSpan.textContent = text
    button.appendChild(textSpan)
    container.appendChild(button)
    popovers.appendChild(container)
  }

  const checkAllStudioCards = () => document.querySelectorAll(".studio-card").forEach(checkStudioCard)

  const checkStudioCard = (card) => {
    console.log("[skip-intro] checking card", card);
    // get href from card
    const id = card.querySelector(".studio-card-header").getAttribute("href")?.split("/").pop()
    getStudioInfo(id).then(studio => {
      // check for studio first
      const studioSkip = get_skip_first(studio)
      const parent = get_skip_first(studio?.parent_studio)
      const remote = getRemoteStudioSkip(studio?.stash_ids, studio?.parent_studio?.stash_ids)

      if (studioSkip) addPopover(studioSkip, "fa-forward-step", card)
      else if (parent) addPopover(parent, "fa-sitemap", card)
      else if (remote) remote.then(skip => { if (skip) addPopover(skip, "fa-globe", card) })
    })
  }
  // toggle to dark mode if image is dark
  wfke(".studio-card", checkAllStudioCards)
  PluginApi.Event.addEventListener("stash:location", () => {
      wfke(".studio-card", checkAllStudioCards)
  })
}
addSkipIntroIndicator()