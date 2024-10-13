# fbox-tag-download
Downloads opinionated tag videos and images

## Settings
### Download Video Tags
Video tags are intended for use with the [tag-video](https://github.com/feederbox826/plugins/tree/main/plugins/tag-video) plugin. If no videos are available, then the image will be used instead.

Some custom tag images exist, but if one is not available, the auto-generated thumbnail of the video will be used instead.
### Create Missing Tags

> [!WARNING]
> This is currently disabled as some tags that do not reflect the StashDB equivalent are included. Once this is fixed, this option will be re-enabled.

Optionally create missing tags if they have media available

## Tasks
### Get Tags
Replaces default/ empty tags with available tag media with an `[fbox-tag]` parent tag

### Refresh Tags
Adds new tags/ update existing tags if a new version has been released

### Recreate Tags
> [!WARNING]
> This is a very slow process and should only be done when switching between video/ image tags