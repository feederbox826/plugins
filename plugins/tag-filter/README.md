# tag-filter
Addresses [stashapp/stash#2633](https://github.com/stashapp/stash/issues/2633)

Hidden tags are kept locally in 

Adds 🧠 icon to all "Meta-Tags"

Hide selected tags from
  - Scene tag dropdowns (`/scenes/#`)
  - Scraper automatic searching

Does **not** hide tag from
  - Filter search
  - `/tags` searchbox
  - backend GQL
  - Scenes with the tag
  - Parent/ subtag menus (`/tags/#`)

## Toggling the hidden tag (OUTDATED)
![toggling the hidden tag](../../docs/tag-filter-toggle.png)

![demo of hidden tag](../../docs/tag-filter-demo.png)