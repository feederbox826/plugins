
async function editUnorganized() {
  const config = await csLib.getConfiguration('edit-unorganized', {
    organized: false,
    targetTabScenes: 'edit',
    targetTabImages: 'edit',
    targetTabGalleries: 'edit'
  });

  // Handler for scenes
  const openTabScenes = () => {
    if (config.organized || document.querySelector("button.organized-button.not-organized")) {
      wfke(`.nav-item>a[data-rb-event-key="scene-${config.targetTabScenes}-panel"]`, e => e.click());
    }
  };
  csLib.PathElementListener("/scenes/", ".nav-tabs", openTabScenes);

  // Handler for images
  const openTabImages = () => {
    if (config.organized || document.querySelector("button.organized-button.not-organized")) {
      wfke(`.nav-item>a[data-rb-event-key="image-${config.targetTabImages}-panel"]`, e => e.click());
    }
  };
  csLib.PathElementListener("/images/", ".nav-tabs", openTabImages);

  // Handler for galleries
  const openTabGalleries = () => {
    if (config.organized || document.querySelector("button.organized-button.not-organized")) {
      wfke(`.nav-item>a[data-rb-event-key="gallery-${config.targetTabGalleries}-panel"]`, e => e.click());
    }
  };
  csLib.PathElementListener("/galleries/", ".nav-tabs", openTabGalleries);
}

editUnorganized();
