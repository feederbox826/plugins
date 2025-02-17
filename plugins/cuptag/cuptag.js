const ok = () => ({ output: "ok" })

function main() {
    log.Debug("Running cuptag plugin")
    const mode = input.Args.mode
    if (!mode) {
        // just return
        return ok()
    }
    getPerformers()
}

// helper functions
function findTag(tagname) {
    const result = gql.Do(`
        query ($tagname: String!) {
        findTags(tag_filter: {
            name: { value: $tagname, modifier: EQUALS }
            OR: { aliases: { value: $tagname, modifier: EQUALS } }
        }) {
            tags { id }
        }
    }`, { tagname })
    if (result.findTags.tags.length == 1) {
        log.Debug(`Found tag ${tagname}`)
        return result.findTags.tags[0].id
    } else {
        return null
    }
}

const createChildTag = (tagname, parentid) =>
    gql.Do(`
        mutation ($tagname: String!, $parentid: ID!) {
        tagCreate(
            input: {
                name: $tagname,
                parent_ids: [$parentid],
                ignore_auto_tag: true
        }) { id }
    }`, {
        tagname,
        parentid
    }).tagCreate.id

const createTag = (tagname) =>
    gql.Do(`
        mutation ($tagname: String!) {
        tagCreate(
            input: { name: $tagname, ignore_auto_tag: true }
        ) { id }
    }`, { tagname }).tagCreate.id

function findOrAddCupTag(size) {
    // look for tag
    const tag = findTag(size)
    if (tag) {
        return tag
    } else {
        // create tag
        return createChildTag(size, parentTagID)
    }
}

function addTag(performerID, tagID) {
    const oldtags = gql.Do(`
        query ($id: ID!) {
        findPerformer(id: $id) {
            tags { id
    }}}`, {
        id: performerID
    }).findPerformer.tags
        .map(tag => tag.id)
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

// constants
const PREFIX = "[Cup]: "
const PARENT_TAG_NAME = PREFIX+"Size"
const CUP_CONVERSION = {
    "DD": "E/DD",
    "E": "E/DD",
    "DDD": "F/DDD",
    "F": "F/DDD",
    "DDDD": "G/DDDD",
    "G": "G/DDDD",
}

// get parent cuptag
const parentTagID = findTag(PARENT_TAG_NAME)
if (!parentTagID) {
    log.Info("Parent tag not found")
    createTag(PARENT_TAG_NAME)
}

// iterate over performer
const getPerformers = () => {
    const results =  gql.Do(`
        query ($exid: [ID!]) {
        findPerformers(
        performer_filter: {
            tags: {
                excludes: $exid,
                modifier: INCLUDES_ALL,
                depth: -1,
                value: [] }
            measurements: { modifier: NOT_NULL, value: "" }}) {
    performers {
        id measurements
    }}}`, {
        exid: [parentTagID]
    })
    const performers = results.findPerformers.performers
    log.Debug(`Tagging ${performers.length} performers`)
    for (const performer of performers) {
        setPerformer(performer.id, performer.measurements)
    }
}

// get performer
function setPerformer(id, measurements) {
    log.Debug(`Trying to tag performer: ${id}`)
    // split measurements
    const cupRegex = /\d{2}([A-H]{1}|A{1,3}|D{2,4})(?:-\d{2}-\d{2})?/
    if (!cupRegex.test(measurements)) {
        log.Debug("No eligible cup size found")
        log.Debug(measurements)
        return
    }
    let cupSize = measurements.match(cupRegex)[1]
    // use hardcoded conversion if necessary
    const conversion = CUP_CONVERSION[cupSize]
    if (conversion) cupSize = conversion
    // find or add cuptag
    const cupTag = findOrAddCupTag(PREFIX + cupSize)
    // add cuptag to performer
    addTag(id, cupTag)
    log.Debug(`Added tag ${cupSize} to performer ${id}`)
}
main()