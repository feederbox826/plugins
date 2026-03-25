// hook into video element for skipping
const hookVideo = (endTime) => wfke("video-js>video", (video) => {
  // find video
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

// get skip_first custom field
const getStudioSkip = id => csLib.callGQL({
  query: `query ($id: ID!) {
  findStudio(id: $id) {
    custom_fields parent_studio { custom_fields }
  }}`,
  variables: { id }
}).then(data =>
  // get skip_first custom field from scene, studio or parent studio
  data.findStudio?.custom_fields?.["skip_first"]
    ?? data.findStudio?.parent_studio?.custom_fields?.["skip_first"]
    ?? null
)

// ready on page reloads
async function readyPage(event) {
  // intercept GQL request
  const findScene = event.detail?.data?.findScene
  if (!findScene) return; // only trigger on findScene
  // check if custom skip_first in scene custom fields
  // otherwise check studio and parent studio custom fields for skip_first
  const skip_time = findScene.custom_fields?.["skip_first"]
    ?? await getStudioSkip(findScene.studio.id)
  // try studio first
  if (skip_time) {
    console.log("[skip-intro] Found skip time:", skip_time);
    hookVideo(skip_time); // set up skipper
    return;
  }
}

fbox826.gqlListener.addEventListener("response", readyPage);
