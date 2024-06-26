// handle entries from remote
// import cache from localStorage
const introMap = new Map(Object.entries({
  ...intros,
  ...JSON.parse(localStorage.getItem("skip-intro-cache") || "{}")
}))

// hook into video element for skipping
const hookVideo = (endTime) => wfke("video-js>video", () => {
  // find video
  const video = document.querySelector("video-js>video");
  const seekVideo = (e) => {
    const startTime = video.currentTime; // freeze time for evaluation
    if (startTime == 0) video.currentTime = endTime;
    else if (startTime > endTime) return; // don't skip if already past
    else if (startTime < endTime) video.currentTime = endTime; // skip to end of intro
  };
  video.addEventListener("playing", seekVideo, { once: true });
  video.addEventListener("play", seekVideo, { once: true });
  // only fire events once per video
});

async function cacheNetwork() {
  // cache network sub-studios
  // check if cache is up-to-date
  const cache = localStorage.getItem("skip-intro-cache-len");
  if (cache && cache == networks.length) return;
  // fetch from StashDB
  // add timeout for stashdb
  if (!window?.stashdb) return setTimeout(cacheNetwork, 500)
  const networkCache = {};
  for (const network of Object.keys(networks)) {
    const introTime = networks[network];
    const query = `query ($id: ID) {
      findStudio(id: $id) {
      child_studios {
          id
      }}}`
    const variables = { id: network };
    const dbResponse = await stashdb.callGQL({ query, variables })
    dbResponse.findStudio.child_studios
      .map(studio => studio.id)
      .forEach(studio => networkCache[studio] = introTime);
    // update localstorage cache
    localStorage.setItem("skip-intro-cache-len", networks.length);
    localStorage.setItem("skip-intro-cache", JSON.stringify(networkCache));
  }
}

// ready on page reloads
function readyPage(event) {
  // intercept GQL request
  if (!event.detail?.data?.findScene) return; // only trigger on findScene
  // get stashDB studioID
  const studioID = event.detail.data.findScene.studio.stash_ids.find(
    (id) => id.endpoint == "https://stashdb.org/graphql",
  )?.stash_id;
  if (studioID && introMap.has(studioID)) {
    // check if studio data is in map
    console.debug("skip-intro found and setting up");
    hookVideo(introMap.get(studioID)); // set up skipper
  }
}
fbox826.gqlListener.addEventListener("response", readyPage);
cacheNetwork()
