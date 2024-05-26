const width = 1000,
    height = 1000

var svg = d3.select("#graph")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 1000 1000`)
    .append("g")

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));

function draw(graph) {
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke-width", d => Math.sqrt(d.value))

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("image")
        .attr("xlink:href", d => {
            return d.img
        })
        .attr("x", -8)
        .attr("y", -8)
        .attr("width", 16)
        .attr("height", 16)

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(d => d.name)

    node.on("mouseover", function (d) {
        var connectedNodes = graph.links
        .filter((x) => x.source.name === d.name || x.target.name === d.name)
        .map((x) => (x.source.name === d.name ? x.target.name : x.source.name));

        //my function to highlight node and connected nodes. only highlights first node in map.
        d3.selectAll(".node")
        .attr("fill", c =>
            connectedNodes.indexOf(c.name) > -1
                || c.name === d.name
                    ? "blue"
                    : ""
        );
    })

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)
        .force("link")
        .links(graph.links);

    function ticked() {
        link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        node
        .attr("transform", d => `translate(${d.x},${d.y})`)
    }

    svg.call(d3.zoom().on("zoom", function () {
        svg.attr("transform", d3.event.transform)
    }))
};

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
