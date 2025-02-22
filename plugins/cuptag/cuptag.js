const ok = () => ({ output: "ok" })

async function main() {
    log.Debug("Running cuptag plugin")
    const mode = input.Args.mode
    if (!mode) {
        // just return
        return ok()
    }

    let totalRuns = 0
    let lastTaggedCount = -1
    let currentTaggedCount = 0

    // Keep running until no new performers are tagged
    while (true) {
        currentTaggedCount = await getPerformers()
        log.Debug(`Run ${totalRuns + 1} tagged ${currentTaggedCount} performers`)
        
        // If we didn't tag any new performers or tagged the same amount as last time, stop
        if (currentTaggedCount === 0 || currentTaggedCount === lastTaggedCount) {
            break
        }
        
        lastTaggedCount = currentTaggedCount
        totalRuns++
    }

    log.Debug(`Completed ${totalRuns + 1} runs, total performers processed`)
    return ok()
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
    "A": "A",
    "AA": "AA",
    "B": "B",
    "C": "C",
    "D": "D",
    "H": "H",
    "HH": "I/HH",
    "I": "I/HH",
    "J": "J",
    "JJ": "K/JJ",
    "K": "K/JJ",
    "EE": "F/EE",
    "FF": "G/FF",
    "GG": "H/GG",
    "dd": "E/DD",
    "ddd": "F/DDD",
    "dddd": "G/DDDD",
    "ee": "F/EE",
    "ff": "G/FF",
    "gg": "H/GG",
    "hh": "I/HH",
    "jj": "K/JJ"
}

// get parent cuptag
const parentTagID = findTag(PARENT_TAG_NAME)
if (!parentTagID) {
    log.Info("Parent tag not found")
    createTag(PARENT_TAG_NAME)
}

// iterate over performer
const getPerformers = async () => {
    let page = 1;
    let hasMore = true;
    let totalTagged = 0;

    while (hasMore) {
        const results = gql.Do(`
            query ($exid: [ID!], $page: Int) {
            findPerformers(
                filter: {
                    per_page: 100,
                    page: $page
                },
                performer_filter: {
                    tags: {
                        excludes: $exid,
                        modifier: INCLUDES_ALL,
                        depth: -1,
                        value: [] }
                    measurements: { modifier: NOT_NULL, value: "" }
                }) {
                count
                performers {
                    id 
                    measurements
                    stash_ids {
                        endpoint
                        stash_id
                    }
                }
            }}`, {
            exid: [parentTagID],
            page: page
        })
        
        const performers = results.findPerformers.performers
        const count = results.findPerformers.count
        
        log.Debug(`Processing page ${page} with ${performers.length} performers (Total: ${count})`)
        
        // If no performers found, break
        if (!performers || performers.length === 0) {
            hasMore = false
            continue
        }
        
        for (const performer of performers) {
            setPerformer(performer.id, performer.measurements)
            totalTagged++
        }

        hasMore = performers.length === 100 // If we got full page, there might be more
        page++
    }

    log.Debug(`Finished tagging ${totalTagged} performers`)
    return totalTagged
}

function normalizeCupSize(size) {
    // Remove any spaces
    size = size.trim().toUpperCase();
    
    // Handle special cases
    if (size.includes('/')) return size; // Already normalized
    
    // Remove any non-letter characters
    return size.replace(/[^A-Z]/g, '');
}

function setPerformer(id, measurements) {
    log.Debug(`Trying to tag performer: ${id}`)
    
    // Normalize measurements to handle both formats
    const match = measurements.match(cupRegex)
    if (!match) {
        log.Debug("No eligible cup size found")
        log.Debug(measurements)
        return
    }

    // Extract the numeric and letter parts
    const fullMatch = match[0]
    let cupSize, bandSize

    // Check if it starts with numbers or letters
    if (/^\d/.test(fullMatch)) {
        // Format: 32DD
        bandSize = fullMatch.match(/^\d{2}/)[0]
        cupSize = fullMatch.match(/[A-Z]+/i)[0].toUpperCase()
    } else {
        // Format: DD32
        cupSize = fullMatch.match(/^[A-Z]+/i)[0].toUpperCase()
        bandSize = fullMatch.match(/\d{2}/)[0]
    }

    cupSize = normalizeCupSize(cupSize);
    const conversion = CUP_CONVERSION[cupSize]
    if (conversion) cupSize = conversion

    // Create standardized format for tag
    const tagSize = cupSize
    
    // find or add cuptag
    const cupTag = findOrAddCupTag(PREFIX + tagSize)
    
    // add cuptag to performer
    addTag(id, cupTag)
    log.Debug(`Added tag ${tagSize} to performer ${id}`)
}

// Update the regex to handle more formats
const cupRegex = /(?:\d{2}[A-Z]{1,4}|[A-Z]{1,4}\d{2})(?:-\d{2}-\d{2})?/i

main()