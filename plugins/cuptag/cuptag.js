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
    return tag ? tag : createChildTag(size, parentTagID)
}

function addTag(performerID, tagID) {
    const oldtags = gql.Do(`
        query ($id: ID!) {
        findPerformer(id: $id) {
            tags { id }}}`, {
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
let parentTagID = findTag(PARENT_TAG_NAME)
if (!parentTagID) {
    log.Info("Parent tag not found")
    createTag(PARENT_TAG_NAME)
    // set parentTagID
    parentTagID = findTag(PARENT_TAG_NAME)
}

// iterate over performer
const getPerformers = () => {
    const results =  gql.Do(`
        query ($exid: [ID!]) {
        findPerformers(
        filter: { per_page: -1 }
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
    const count = performers.length
    log.Debug(`Tagging ${count} performers`)
    for (let i=0; i < performers.length; i++) {
        const performer = performers[i]
        log.Progress(i/count)
        setPerformer(performer.id, performer.measurements)
    }
}

function getCupSize(measurements) {
    // split measurements
    const cupRegex = /(A{1,3}|D{2,4}|[F-P]{2}|[A-Z]{1})/i
    if (!cupRegex.test(measurements)) {
        return false
    } 
    const cupSize = measurements.match(cupRegex)[1].toUpperCase()
    // validate cupSize length (repeat)
    if (cupSize.length >= 2 && (cupSize[0] !== cupSize[1])) {
        return false
    }
    // use hardcoded conversion if necessary
    const conversion = CUP_CONVERSION[cupSize]
    return conversion ? conversion : cupSize
}

// get performer
function setPerformer(id, measurements) {
    log.Debug(`Trying to tag performer: ${id}`)
    const cupSize = getCupSize(measurements)
    if (!cupSize) {
        log.Error(`No cup size found for performer ${id} with measurements ${measurements}`)
        return
    }
    // find or add cuptag
    const cupTag = findOrAddCupTag(PREFIX + cupSize)
    // add cuptag to performer
    addTag(id, cupTag)
    log.Info(`Added tag ${cupSize} to performer ${id}`)
}
main()