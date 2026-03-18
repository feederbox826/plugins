function overlay_info() {
  const { React, patch } = window.PluginApi

  // get resolution class name
  const getResolutionClassName = (height) => {
    if (height >= 4320) return "res-4320"
    if (height >= 2880) return "res-2880"
    if (height >= 2160) return "res-2160"
    if (height >= 1440) return "res-1440"
    if (height >= 1080) return "res-1080"
    if (height >= 720) return "res-720"
    if (height >= 540) return "res-540"
    return "res-480"
  }

  const addOverlayInfo = (props, _, SceneSpecs) => {
    // check for file
    const file = props.scene.files?.[0]
    if (!file) return SceneSpecs
    // get resolution classes
    const overlayResolution = SceneSpecs.props.children[1]
    const resolution = getResolutionClassName(file.height)
    overlayResolution.props.className += ` ${resolution}`
    // pull codec info
    const codec = file.video_codec.toUpperCase()
    // add codec to overlay
    const overlayElem = React.createElement(
      "span",
      { className: `overlay-codec codec-${codec}` },
      codec
    )
    SceneSpecs.props.children.unshift(overlayElem)
    return SceneSpecs
  }

  patch.after("SceneCard.SceneSpecs", addOverlayInfo)
}
overlay_info()