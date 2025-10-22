const ok = () => ({ output: "ok" })

function main() {
    log.Debug("Running nationality-tag plugin")
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

function findAddTag(nationality) {
    // look for tag
    const tag = findTag(nationality)
    return tag ? tag : createChildTag(nationality, parentTagID)
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
const PARENT_TAG_NAME = "nationality-tag"

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
            country: { modifier: NOT_NULL, value: "" }}) {
    performers {
        id country
    }}}`, {
        exid: [parentTagID]
    })
    const performers = results.findPerformers.performers
    const count = performers.length
    log.Debug(`Tagging ${count} performers`)
    for (let i=0; i < performers.length; i++) {
        const performer = performers[i]
        log.Progress(i/count)
        setPerformer(performer.id, performer.country)
    }
}

// get performer
function setPerformer(id, country) {
    log.Debug(`Trying to tag performer: ${id}`)
    const perfNat = getNat(country)
    if (!perfNat) {
        log.Error(`No matching nationality found for performer ${id} with country ${country}`)
        return
    }
    // find or add natTag
    const natTag = findAddTag(perfNat)
    // add natTag to performer
    addTag(id, natTag)
    log.Info(`Added tag ${perfNat} to performer ${id}`)
}
main()

// manual map to stashdb nationalities, please open an issue if a new tag is created
// https://stashdb.org/categories/7f4ddc1b-8169-4d5b-b764-04ad074c84a8
function getNat(country) {
    const nationalityMap = {"AL":"Albanian","AR":"Argentinian","AT":"Austrian","AU":"Australian","BE":"Belgian","BG":"Bulgarian","BR":"Brazilian","BY":"Belarusian","CA":"Canadian","CH":"Swiss","CN":"Chinese","CO":"Colombian","CR":"Costa Rican","CU":"Cuban","CZ":"Czech","DE":"German","DK":"Danish","DO":"Dominican","DZ":"Algerian","EC":"Ecuadorian","EE":"Estonian","ES":"Spanish","FI":"Finnish","FR":"French","GB":"British","GH":"Ghanaian","GR":"Greek","GT":"Guatemalan","HK":"Hongkonger","HT":"Haitian","HU":"Hungarian","ID":"Indonesian","IE":"Irish","IL":"Israeli","IS":"Icelandic","IT":"Italian","JP":"Japanese","KG":"Kyrgyz","KR":"Korean","LB":"Lebanese","LT":"Lithuanian","LV":"Latvian","MD":"Moldovan","MN":"Mongolian","MX":"Mexican","NL":"Dutch","NO":"Norwegian","PE":"Peruvian","PH":"Filipino","PL":"Polish","PT":"Portuguese","RO":"Romanian","RS":"Serbian","RU":"Russian","SA":"Saudi Arabian","SE":"Swedish","SG":"Singaporean","SI":"Slovenian","SK":"Slovakian","TH":"Thai","TR":"Turkish","TW":"Taiwanese","UA":"Ukrainian","US":"American","UY":"Uruguayan","VE":"Venezuelan","VN":"Vietnamese"}
    return nationalityMap[country] || null
}