# skip-intro

# v0.3

> [!WARNING]
> Stash v0.31+ ONLY

Reads from the custom_field `skip_first` which is a number for how many seconds to skip ahead. In order of priority:
1. Scene
2. Studio
3. Parent of Studio
4. (Remote) Studio
5. (Remote) Parent of Studio

If there is no `skip_first` at a lower level, it will default to the higher level until a value is found.
If no results are found locally, skips-db is queried at the studio and parent studio level.

After pausing, you can use the following command to get the time to skip to.
```js
document.querySelector("video-js>video").currentTime
```

The static [stash-skip-intro](https://github.com/feederbox826/stash-skip-intro) database has been replaced with [skips-db](https://github.com/feederbox826/skips-db) - a crowdsourced instance for skip times. All existing times have been imported. Local times (including 0 for no intro/ inconsistent intro) can be submitted via [skip-intro-sync](https://github.com/feederbox826/plugins/tree/main/plugins/skip-intro-sync)