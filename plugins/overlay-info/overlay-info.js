const { React, patch } = window.PluginApi

const findChildPropClass = (elem, className) => elem.props.children.find(({ props }) => props.className === className)

const addOverlayInfo = (props, _, SceneCardImage) => {
  // grab file
  const file = props.scene.files?.[0]
  if (!file) return SceneCardImage
  const overlay = findChildPropClass(SceneCardImage, "scene-specs-overlay")
  const overlayResolution = findChildPropClass(overlay, "overlay-resolution")
  // get overlay element
  const overlayProps = overlay.props.children
  // add resolution classes
  const resolution = overlayResolution.props.children[1]
  overlayResolution.props.className += ` res-${resolution}`
  // pull codec info
  const codec = file.video_codec.toUpperCase()
  // add codec to overlay
  const overlayElem = React.createElement(
    "span",
    { className: `overlay-codec codec-${codec}` },
    codec
  )
  overlayProps.unshift(overlayElem)
  return SceneCardImage
}

patch.after("SceneCard.Image", addOverlayInfo)