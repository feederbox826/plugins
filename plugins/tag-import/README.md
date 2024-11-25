# fbox-tag-download
Downloads opinionated tag videos and images from tags.feederbox.cc. See [feederbox.cc/gh/tags](https://feederbox.cc/gh/tags) for details

## Settings
### Download Video Tags
Video tags are intended for use with the [tag-video](https://github.com/feederbox826/plugins/tree/main/plugins/tag-video) plugin. If no videos are available, then the image will be used instead.

Some custom tag images exist, but if one is not available, the auto-generated thumbnail of the video will be used instead.
### Create Missing Tags
Optionally create missing tags if they have media available

## Tasks
### Get Tags
Replaces default/ empty tags with available tag media with an `[fbox-tag]` parent tag

### Refresh Tags
Adds new tags/ update existing tags if it has been updated

### Recreate Tags
> [!WARNING]
> This is a very slow process and should only be done when switching between video/ image tags

Downloads tag videos/images, overwriting existing ones if they are tagged with `[fbox-tag]`