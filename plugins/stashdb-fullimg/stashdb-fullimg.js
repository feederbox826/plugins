// add graphql intercept
const fullImgInt = async (data, query) => {
    // check that we are doing ScrapeSingleScene query
    if (!data?.data?.scrapeSingleScene || query?.operationName !== "ScrapeSingleScene") return data
    // inject high-res link
    const cdnURL = await createCDNUrl(data.data.scrapeSingleScene[0].remote_site_id)
    data.data.scrapeSingleScene[0].image = cdnURL
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
