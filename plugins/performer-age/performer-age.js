const ok = () => ({ output: "ok" })

const TAG_NAMES = [
  "18+",
  "20+",
  "30+",
  "40+",
  "50+",
  "60+",
  "70+"
]

function main() {
  log.Debug("Running performer-age plugin")
  const mode = input.Args.mode
  if (!mode) {
    // just return
    return ok()
  }
  if (mode == "real-age") {
    log.Debug("Running in real-age mode")
    // iterate over age array
    const AGE_TAGS = [
      [18, 19, "18+"],
      [20, 29, "20+"],
      [30, 39, "30+"],
      [40, 49, "40+"],
      [50, 59, "50+"],
      [60, 69, "60+"],
      [70, Infinity, "70+"]
    ]
    for (const [low, high, tagName] of AGE_TAGS) {
      getPerformers(low, high, tagName)
    }
  }
}

// helper functions
// get array of existing tags to remove firom filter
const getExistingTags = () => TAG_NAMES
  .map(tagname => findTag(tagname))
  .filter(tag => tag != null)

const EXISTING_TAGS = getExistingTags()

function findTag(tagname) {
  const result = gql.Do(`
    query ($tagname: String!) {
    findTags(tag_filter: {
      name: { value: $tagname, modifier: EQUALS }
      OR: { aliases: { value: $tagname, modifier: EQUALS } }
    }) {
      tags { id }
    }}`, { tagname })
  if (result.findTags.tags.length == 1) {
    log.Debug(`Found tag ${tagname}`)
    return result.findTags.tags[0].id
  } else {
    return null
  }
}

const createTag = (tagname) =>
  gql.Do(`
    mutation ($tagname: String!) {
    tagCreate(
      input: { name: $tagname, ignore_auto_tag: true }
    ) { id }
  }`, { tagname }).tagCreate.id

function findCreateTag(name) {
  // look for tag
  const tag = findTag(name)
  return tag ? tag : createTag(name)
}

function addTag(performerID, tagID) {
  const oldtags = gql.Do(`
    query ($id: ID!) {
    findPerformer(id: $id) {
      tags { id }}}`, {
    id: performerID
  }).findPerformer.tags
    .map(tag => tag.id)
    .filter(id => !EXISTING_TAGS.includes(id))
  gql.Do(`
    mutation ($performerID: ID!, $newtags: [ID!]) {
    performerUpdate(
      input: { id: $performerID, tag_ids: $newtags }
    ) { id }}`,
  {
      performerID,
      newtags: oldtags.concat(tagID)
  })
}

// get performers in range
function getPerformers (low, high, tagName) {
  // create tag at the end if we have matches
  const result = gql.Do(`
    query ($low: Int!, $high: Int!) {
    findPerformers(
      performer_filter: { age: { value: $low, modifier: BETWEEN, value2: $high } }
      filter: { per_page: -1 }
    ) {
      count
      performers {
        name
        id
      }}}
    `, { low, high })
  const performers = result.findPerformers.performers
  const count = result.findPerformers.count
  log.Debug(`Found ${count} performers in range ${low}-${high}`)
  if (count == 0) return
  // find tag
  const tagID = findCreateTag(tagName)
  // add tag to performers
  for (const idx = 0; idx < performers.length; idx++) {
    const performer = performers[idx]
    log.Debug(`Processing performer ${current}/${count}: ${performer.name}`)
    log.Progress(idx/current)
    // add tag to performer
    addTag(performer.id, tagID)
  }
}
main()