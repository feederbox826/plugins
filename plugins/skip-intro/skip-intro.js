// handle entries from remote
const introMap = new Map(Object.entries(intros));

// hook into video element for skipping
const hookVideo = (endTime) => wfke("video", () => {
  // find video
  const video = document.querySelector("video");
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

// ready on page reloads
function readyPage(event) {
  // intercept GQL request
  if (!event.detail.data.findScene) return; // only trigger on findScene
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
