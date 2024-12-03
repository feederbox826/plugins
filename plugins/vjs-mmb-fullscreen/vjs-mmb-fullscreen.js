// listen for event to bind
document.addEventListener("vjs-shortcut:ready", (evt) => {
  const player = evt.detail.player
  const toggleFullscreen = () => player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
  player.on("mousedown", (event) => {
    if (event.buttons == 4) { // if middle mouse, toggle fullscreen
      toggleFullscreen();
      event.preventDefault()
    }
  });
})