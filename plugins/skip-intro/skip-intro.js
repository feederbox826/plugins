// import cache from localStorage
const introMap = new Map(Object.entries({
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

const getNetworkID = (studioid) => csLib.callGQL({
  query: `query ($id: ID!) {
  findStudio(id: $id) {
    stash_ids {
      endpoint stash_id
  }}}`,
  variables: { id: studioid },
}).then(data => getSDBID(data.findStudio.stash_ids));

const getSDBID = (stash_ids) => stash_ids.find(id => id.endpoint == "https://stashdb.org/graphql")?.stash_id

// ready on page reloads
function readyPage(event) {
  // intercept GQL request
  if (!event.detail?.data?.findScene) return; // only trigger on findScene
  // get stashDB studioID
  const studio = event.detail.data.findScene.studio
  const studioID = getSDBID(studio.stash_ids)
  // try studio first
  if (studioID && introMap.has(studioID)) {
    // check if studio data is in map
    console.debug("skip-intro found and setting up");
    hookVideo(introMap.get(studioID)); // set up skipper
    return;
  }
  // if parentStudio, get id
  if (studio.parent_studio)
    getNetworkID(studio.parent_studio.id)
      .then(networkID => {
        if (networkID && introMap.has(networkID)) {
          // check if network data is in map
          console.debug("skip-intro found and setting up");
          hookVideo(introMap.get(networkID)); // set up skipper
        }
      })
}
const cacheIntros = () =>
  fetch("https://feederbox826.github.io/stash-skip-intro/intros.json")
    .then(response => response.json())
    .then(data => {
      for (const [key, value] of Object.entries(data)) {
        introMap.set(key, value);
      }
      localStorage.setItem("skip-intro-cache", JSON.stringify(Object.fromEntries(introMap)))
    })

fbox826.gqlListener.addEventListener("response", readyPage);
cacheIntros()
