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

// utils
const get_skip_first = (obj) => obj?.custom_fields?.["skip_first"]; // for consistent custom_field name
const get_stashdb_id = (stashids) => stashids?.find(id => id.endpoint === "https://stashdb.org/graphql")?.stash_id

// get skip_first custom field
const getStudioSkip = id => csLib.callGQL({
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
}).then(data =>
  //get skip_first custom field from scene, studio or parent studio
  get_skip_first(data.findStudio)
    ?? get_skip_first(data.findStudio?.parent_studio)
    ?? getRemoteStudioSkip(data.findStudio.stash_ids, data.findStudio.parent_studio?.stash_ids)
)

const getRemoteSkipTime = async (id) => fetch(`https://skips.feederbox.cc/api/time/${id}`)
  .then(res => res.json())
  .then(data => data.skip_seconds)
  .catch(() => undefined) // if error/ 404, return undefined

const getRemoteStudioSkip = async (stashids, parent_stashids) => {
  const stashid = get_stashdb_id(stashids);
  const parent_stashid = get_stashdb_id(parent_stashids);
  console.log("[skip-intro] fetching from remote", { stashid, parent_stashid });
  return stashid ? await getRemoteSkipTime(stashid)
    : parent_stashid ? await getRemoteSkipTime(parent_stashid)
      : null
}

// ready on page reloads
async function readyPage(event) {
  // intercept GQL request
  const findScene = event.detail?.data?.findScene
  if (!findScene) return; // only trigger on findScene
  // check if custom skip_first in scene custom fields
  // otherwise check studio and parent studio custom fields for skip_first
  const skip_time = get_skip_first(findScene)
    ?? await getStudioSkip(findScene.studio.id)
  // try studio first
  if (skip_time) {
    console.log("[skip-intro] Found skip time:", skip_time);
    hookVideo(skip_time); // set up skipper
    return;
  }
}

fbox826.gqlListener.addEventListener("response", readyPage);
