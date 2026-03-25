# skip-intro

# v0.3

> [!WARNING]
> Stash v0.31+ ONLY

Reads from the custom_field `skip_first` which is a number for how many seconds to skip ahead. In order of priority:
1. Scene
2. Studio
3. Parent of Studio

If there is no `skip_first` at a lower level, it will default to the higher level until a value is found. If no value is found, there will be no auto-skip.

After pausing, you can use the following command to get the time to skip to.
```js
document.querySelector("video-js>video").currentTime
```

Pulling from the [database](https://github.com/feederbox826/stash-skip-intro) has been removed. Everything now stays local to your stash, the old times have not been imported