# custom-filepath
a custom filepath encoder for stash

## Settings
The interactive tester is available at http://localhost:9999/plugin/custom-filepath/assets/test.html

Operations are applied in the following order:
1. Replace the path prefix (strip/add)
2. Run any regex replacements
3. Add the URI prefix and encode spaces

## Path Prefix
Use the path prefix fields to map between local and host paths

A local file at:
```
/tank/movies/Blender/Big Buck Bunny.mp4
```
but mapped to Stash as:
```
/media/Blender/Big Buck Bunny.mp4
```
can be achieved with:
- Prefix to strip: `/movies/`
- Prefix to add: `/tank/movies`
This will correctly remap between your Stash paths and local filesystem paths
## URI Prefix
If you have a browseable file host (e.g., `http://unraid.example.org/copyparty`), you can add a URI prefix
- This will prepend the prefix to the final path
- Spaces are automatically URL-encoded

example output:
```
https://unraid.example.org/copyparty/media/Blender/Big%20Buck%20Bunny.mp4
```
You can also use other URI schemes like `file:///` or `ftp://`
## Regex pattern
Use regex pattern for custom path transformations
- The regex pattern is passed into JavaScript's [`new RegExp()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp) constructor with the global `g` flag enabled
- If the replacement string is blank, the matched text will be removed