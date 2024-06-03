async function main() {
    // create watched badge to clone and add
    const watchedBadge = document.createElement("div")
    watchedBadge.classList = "watched-badge"
    const badge = document.createElement("i")
    badge.classList = "fa-solid fa-circle-check"
    watchedBadge.append(badge)

    // check if scene is watched
    // additional toggle for partially-watched scenes
    const flagPartialWatch = forbiddenConfig.getPluginSetting("watched-video", "flagPartialWatch", false)
    const isWatched = (scene) =>
        scene.play_count >= 0 // has play counts
        && (scene.resume_time == 0 || // has 0 resume time or...
           (flagPartialWatch && scene.resume_time > 0)) // if flagPartialWatch is enabled, has any resume time
        && scene.play_duration >= 10 // has been played for at least 10 seconds
    function filterScenes(sceneid) {
        // iterate over all maches
        document.querySelectorAll(`.scene-card:has(a[href^="/scenes/${sceneid}"])`)
            .forEach(match => {
                match.classList.add("watched") // add watched class
                match.prepend(watchedBadge.cloneNode(true)) // add watched badge
            })
    }
    // wait for scene gql response
    const watchedListener = (event) => {
        // check if scene gql response
        if (!event.detail?.data?.findScenes) return
        // filter scenes with watched status
        const sceneIDs = event.detail.data.findScenes.scenes
            .filter(isWatched) // filter watched scenes
            .map(scene => scene.id) // get scene ids
        // await cards
        wfke(".scene-card", () => sceneIDs.forEach(filterScenes))
    }
    window.fbox826.gqlListener.addEventListener("response", watchedListener)
}
main()