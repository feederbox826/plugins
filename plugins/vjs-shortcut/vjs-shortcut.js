// see README for shortcuts

/*
// ,. will override stash commands when focused on video
. - when paused, step forward one frame
, - when paused, step back one frame
> - speed up playback rate
< - slow down playback rate
c - activate/ deactivate captions
*/

// declarations
let video, player, framestep;

wfke("video-js", init);

// get all candidates, find the one that contains "fps"
const getFrameRate = () =>
  [...document.querySelectorAll(".scene-file-info dd")]
    .find((candidate) => candidate.innerText.includes("fps"))
    .textContent.split(" ")[0];

const toggleCaptions = () => {
  const track = player.textTracks().tracks[0];
  track.mode = track.mode == "showing" ? "hidden" : "showing";
};

const changePbRate = (increase = true) => {
  // fetch playback rates
  const rates = player.playbackRates();
  // get current playback rate
  const curRate = player.playbackRate();
  // get index of playback rate to increase or decrease
  const curRateIdx = rates.findIndex((e) => e == curRate);
  const incrRate = rates[curRateIdx + 1];
  const decrRate = rates[curRateIdx - 1];
  // if increase and is valid, increase
  // if decrease and is valid, decrease
  // otherwise do not change
  const newRate =
    increase && incrRate ? incrRate : decrRate ? decrRate : curRate;
  player.playbackRate(newRate);
};

function handleKey(evt) {
  const key = evt.key;
  // Home | 0 - Seek to start of video
  if (key == "Home" || key == "0") {
    video.currentTime = 0;
    evt.preventDefault();
  }
  // End - Seek to end of video
  else if (key == "End") {
    video.currentTime = video.duration;
    evt.preventDefault();
  }
  // . - Step forward 1 frame
  else if (key == "." && video.paused) {
    video.currentTime += framestep;
    evt.preventDefault();
  } // , - step backward 1 frame
  else if (key == "," && video.paused) {
    video.currentTime -= framestep;
    evt.preventDefault();
  }
  // slow down playback rate
  else if (key == "<") changePbRate(false);
  // speed up playback rate
  else if (key == ">") changePbRate(true);
  // c - toggle captions
  else if (key == "c") toggleCaptions();
  // Shift+N - Jump to next video
  else if (key == "N" && evt.shiftKey) player.skipButtons().onNext()
  // Shift+P - Jump to previous video
  else if (key == "P" && evt.shiftKey) player.skipButtons().onPrevious()
}

// constants
function init() {
  player = document.querySelector("video-js").player;
  video = document.querySelector("video-js>video");
  player.on("keydown", handleKey);
  // once scene info is loaded, get framerate
  wfke(".scene-file-info", () => framestep = 1 / getFrameRate());
}