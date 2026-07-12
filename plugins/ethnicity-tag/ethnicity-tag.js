const ok = () => ({ output: "ok" })

function main() {
    log.Debug("Running ethnicity-tag plugin")
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

function findAddTag(ethnicity) {
    // look for tag
    const tag = findTag(ethnicity)
    return tag ? tag : createChildTag(ethnicity, parentTagID)
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
const PARENT_TAG_NAME = "ethnicity-tag"

// get parent tag
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
            ethnicity: { modifier: NOT_NULL, value: "" }}) {
    performers {
        id ethnicity
    }}}`, {
        exid: [parentTagID]
    })
    const performers = results.findPerformers.performers
    const count = performers.length
    log.Debug(`Tagging ${count} performers`)
    for (let i=0; i < performers.length; i++) {
        const performer = performers[i]
        log.Progress(i/count)
        setPerformer(performer.id, performer.ethnicity)
    }
}

// manual map to stashdb dropdown, please open an issue if a new tag is created
// https://github.com/stashapp/stash-box/blob/master/frontend/src/pages/performers/performerForm/PerformerForm.tsx#L96-L106
const ethMap = [
    'Caucasian',
    'Black',
    'Asian',
    'Indian',
    'Latin',
    'Middle Eastern',
    'Mixed',
    'Other'
]

// get performer
function setPerformer(id, ethnicity) {
log.Debug(`Trying to tag performer: ${id}`)
    if (!ethnicity || !ethMap.includes(ethnicity)) {
        log.Error(`Performer ${id} has no matching ethnicity ${ethnicity}`)
        return
    }
    // find or add ethTag
    const ethTag = findAddTag(ethnicity)
    // add ethTag to performer
    addTag(id, ethTag)
    log.Info(`Added tag ${ethnicity} to performer ${id}`)
}
main()