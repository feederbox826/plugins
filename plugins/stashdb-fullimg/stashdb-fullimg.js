// add graphql intercept
const fullImgInt = async (data, query) => {
    // check operations
    if (query?.operationName !== "ScrapeSingleScene" && query?.operationName !== "ScrapeMultiScenes") return data
    // single injection
    if (data.data?.scrapeSingleScene) {
        // inject high-res link
        const cdnURL = await createCDNUrl(data.data.scrapeSingleScene[0].remote_site_id)
        data.data.scrapeSingleScene[0].image = cdnURL
    }
    // multi-injection
    if (data.data?.scrapeMultiScenes) {
        for (let sceneIdx = 0; sceneIdx < data.data.scrapeMultiScenes.length; sceneIdx++) {
            for (let resultIdx = 0; resultIdx < data.data.scrapeMultiScenes[sceneIdx].length; resultIdx++) {
                const cdnURL = await createCDNUrl(data.data.scrapeMultiScenes[sceneIdx][resultIdx].remote_site_id)
                data.data.scrapeMultiScenes[sceneIdx][resultIdx].image = cdnURL
            }
        }
    }
    return data
}

// fetch fullsize image
const createCDNUrl = async (stashid) =>
    stashdb.callGQL({
        query: `query FindScene($id: ID!) {
            findScene(id: $id) { images { id } }}`,
        variables: { id: stashid }
    })
    .then(resp => resp.findScene.images[0].id)
    .then(id => `https://cdn.stashdb.org/images/${id.substring(0,2)}/${id.substring(2,4)}/${id}`)

window.fbox826.interceptors.push(fullImgInt)
