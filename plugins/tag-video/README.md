# tag-video
adds video support to tag images

`<img>` tags suffer greatly when they are playing longer animated images because of performance optimization. This bypasses this entirely by replacing them with videos with fallbacks to static images.

When tag videos are hovered, they are unmuted and restarted until they are no longer hovered.

When the tab is not focused, the videos will auto-pause and mute after 2 seconds, and slowly restart when back in focus