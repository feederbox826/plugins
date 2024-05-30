# feederbox826-plugins

Index URL: `https://feederbox826.github.io/plugins/main/index.yml`

![Adding repository](docs/add-plugins.png)

# Plugins
avg-rating
- adds average rating to (studios, performers, movies) in %

deleteFP
- adds a button to delete fingerprints

markergen
- generate markers once they've been saved

rebrand
- add a custom name instead of "Stash" to identify your instance(s)

stash-omnisearch
- fork of [stash-omnisearch](https://github.com/hozaywut/stash-omnisearch) for v24+
- Licenced ISC

studio-img-bg
- Add drop shadows to studio logos

tag-filter
- Marks tags as "Meta-Tags"
- Filters out tags from select menus

tag-graph-js
- Tag graph visualization with d3.js
- [stg-annon/tagGraph](https://github.com/stg-annon/StashScripts/tree/main/plugins/tagGraph) is recommended in lieu of this plugin

tag-video
- support `<videos>` in tags, useful for having large walls of animated tags (Animated GIFs are not optimized)

watched-video
- adds badge and css class to watched videos

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

fontawesome-js
- adds support for `<i>` style fontawesome icons with vanilla JS