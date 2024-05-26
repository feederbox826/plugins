function parse(source) {
    const nodes = []
    const links = []
    for (const tag of source.data.allTags) {
        nodes.push({ id: tag.id, name: tag.name.trim(), img: tag.image_path })
        for (const child of tag.children) {
            links.push({ source: tag.id, target: child.id })
        }
    }
    return { nodes, links }
}
async function parseTags() {
    const query = `query { allTags { name id image_path children { id } }}`
    const source = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    }).then(r => r.json())
    return parse(source)
}