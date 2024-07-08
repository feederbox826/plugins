# forbiddenConfig

exposes the Configuration store from teh cache to the global scope. This allows for async-less access to plugin settings and also expose sthe GQL key

usage
```js
const gqlKey = window.forbiddenConfig.gqlKey

const pluginSettings = window.forbiddenConfig.getPluginSettings(pluginName, settingName, fallback)
```