// use declared player, add mouseDown and mouseWheel events

document.addEventListener("vjs-shortcut:ready", (event) => {
  const player = event.detail.player
  const resetFOV = () => {
    const camera = player.vr().camera
    camera.fov = 75
    camera.updateProjectionMatrix()
  }
  const setFOV = (increase) => {
    const camera = player.vr().camera
    let newFov = camera.fov += increase ? 5 : -5
    if (newFov >= 180) newFov = 180
    if (newFov <= 10) newFov = 10
    camera.fov = newFov
    camera.updateProjectionMatrix()
  }
  player.on("mousedown", (event) => {
    if (event.buttons == 4) { // if middle mouse, reset zoom
      resetFOV()
      event.preventDefault()
    }
  })
  player.on("wheel", (event) => {
    setFOV(event.deltaY>0)
    event.preventDefault()
    event.stopPropagation()
  })
})