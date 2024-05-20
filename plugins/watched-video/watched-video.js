async function main() {
    // create watched badge to clone and add
    const watchedBadge = document.createElement("div")
    watchedBadge.classList.add("watched-badge")
    watchedBadge.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm113-303L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>`

    // check if scene is watched
    // additional toggle for partially-watched scenes
    const flagPartialWatch = forbiddenConfig.getPluginSetting("watched-video", "flagPartialWatch", false)
    const isWatched = (scene) =>
        scene.play_count >= 0 // has play counts
        && (scene.resume_time == 0 || // has 0 resume time or...
           (flagPartialWatch && scene.resume_time > 0)) // if flagPartialWatch is enabled, has any resume time
        && scene.play_duration >= 10 // has been played for at least 10 seconds
    function filterScenes(sceneid) {
        // find matching scene card
        const match = document.querySelector(`.scene-card:has(a[href^="/scenes/${sceneid}"])`)
        match.appendChild(watchedBadge.cloneNode(true)) // add watched badge
        match.classList.add("watched") // add watched class
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