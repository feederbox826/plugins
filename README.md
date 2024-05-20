# feederbox826-plugins

Index URL: `https://feederbox826.github.io/plugins/main/index.yml`

![Adding repository](docs/add-plugins.png)

# Plugins
deleteFP
- adds a button to delete fingerprints

markergen
- generate markers once they've been saved

rebrand
- add a custom name instead of "Stash" to identify your instance(s)

tag-video
- support `<videos>` in tags, useful for having large walls of animated tags (Animated GIFs are not optimized)

watched-video
- adds badge and css class to watched videos

studio-img-bg
- Add drop shadows to studio logos

# Dependency plugins
forbiddenConfig
- dependency for pulling plugin settings (and more) through Apollo cache
  - ```js
    const settingValue = forbiddenConfig.getPluginSetting("plugin-name", "setting-name", "fallback")
    ```

0gql-intercept
- adds window.fbox826 instance for
  - GQL filtering (incoming requests)
  - GQL events