// exposes the forbidden Configuration store to the global scope

const root = window.__APOLLO_CLIENT__.cache.data.data.ROOT_QUERY

const forbiddenConfig = {
    // export root config
    root: root,
    // plugin settings dictionary
    pluginSettings: root.configuration.plugins,
    // get plugin settings
    getPluginSetting: (pluginName, settingName, fallback) => root.configuration.plugins[pluginName][settingName] ?? fallback,
    // graphQL apikey
    gqlKey: root.configuration.general.apiKey
}

window.forbiddenConfig = forbiddenConfig