async function editUnorganized() {
  const config = await csLib.getConfiguration('edit-unorganized', { organized: false, targetTab: 'edit' });
  const openTab = () => {
    if (config.organized || document.querySelector("button.organized-button.not-organized"))
      wfke(`.nav-item>a[data-rb-event-key="scene-${config.targetTab}-panel"]`, e => e.click())
  }
  csLib.PathElementListener("/scenes/", ".nav-tabs", openTab)
}
editUnorganized();
