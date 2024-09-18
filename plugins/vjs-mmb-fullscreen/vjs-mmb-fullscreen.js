// use declared player, add mousedown event

const toggleFullscreen = () => player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();

player.on("mousedown", (event) => {
  if (event.buttons == 4) {   // if middle mouse, toggle fullscreen
    toggleFullscreen();
    event.preventDefault()
  }
});
