function setupOmniBox() {
    //
}

const gqlFetch = (query, variables) =>
    fetch("/graphql", {
    method: "POST",
    headers: {"Content-Type": "application/json" },
    body: JSON.stringify({ variables, query, }),
})
.then((d) => d.json())
.then((d) => d.data);

const query = `query FindMatches($performer_filter: FindFilterType, $tag_filter: FindFilterType,
    $scene_filter: FindFilterType, $studio_filter: FindFilterType) {
    findStudios(filter: $studio_filter){
        studios { id name image_path }}
    findPerformers(filter: $performer_filter) {
        performers { id name details disambiguation alias_list image_path }}
    findTags(filter: $tag_filter) {
        tags { id name aliases description image_path }}
    findScenes(filter: $scene_filter) {
        scenes { id title details paths { screenshot }}}}`;

const comboGqlFetch = async (term) => {
    const searchTerm = term.trim().replace("/", "");
    const tagFilter = {
        sort: "name",
        direction: "ASC",
    };
    const studioFilter = {
        sort: "name",
        direction: "ASC",
    };
    const performerFilter = {
        sort: "rating",
        direction: "DESC",
    };
    const sceneFilter = {
        sort: "created_at",
        direction: "DESC",
    };
    const defaultFilters = {
        q: searchTerm,
        page: 1,
        per_page: maxResultsPerEntity,
    };
    const filters = {
        studio_filter: {
            ...defaultFilters,
            ...studioFilter,
        },
        performer_filter: {
            ...defaultFilters,
            ...performerFilter,
        },
        tag_filter: {
            ...defaultFilters,
            ...tagFilter,
        },
        scene_filter: {
            ...defaultFilters,
            ...sceneFilter,
        },
    };
    const result = await gqlFetch(query, filters);
    const studios = result.findStudios.studios.map((t) => ({
        id: t.id,
        type: "studio",
        label: t.name,
        details: "",
        image: t.image_path,
    }));
    const tags = result.findTags.tags.map((t) => ({
        id: t.id,
        type: "tag",
        label: t.name,
        aliases: t.aliases,
        details: t.description,
        image: t.image_path,
    }));
    const performers = result.findPerformers.performers.map((p) => ({
        id: p.id,
        type: "performer",
        label: p.name,
        aliases: [...p.alias_list, p.disambiguation],
        details: "",
        image: p.image_path,
    }));
    const scenes = result.findScenes.scenes.map((s) => ({
        id: s.id,
        type: "scene",
        label: s.title,
        aliases: "",
        details: s.details,
        image: s.paths.screenshot,
    }));
    return [...tags, ...performers, ...scenes, ...studios];
};

const settingsTabs = ["tasks", "plugins", "interface", "security", "stats"];
const pages = [ "scenes", "images", "movies", "markers","galleries", "performers", "tags", "studios"];

// how many we will request from the server
const maxResultsPerEntity = 10;

// how many we will display
const maxResultsDisplayed = 10;

const body = document.body;

// new div for the omnisearch
const omnisearch = document.createElement("div");
omnisearch.id = "omnisearch";
body.appendChild(omnisearch);

// add backdrop
const backdrop = document.createElement("div");
backdrop.classList = "fade modal-backdrop show"
backdrop.addEventListener("click", () => {
    // remove visible class from the omnisearch
    omnisearch.classList.remove("visible");
    searchInput.blur();
    searchInput.value = "";
});
omnisearch.appendChild(backdrop);

// create the search input
const searchInput = document.createElement("input");
searchInput.id = "omnisearch-search-input";
searchInput.classList.add("omnisearch-input");
searchInput.type = "text";
searchInput.placeholder = "⌘ + / ";
omnisearch.appendChild(searchInput);

// create the search results container
const searchResults = document.createElement("div");
searchResults.id = "search-results";
searchResults.classList.add("omnisearch-results");
omnisearch.appendChild(searchResults);

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(args), delay);
    };
};

async function searchAndDisplay(e) {
    if (searchInput.value.startsWith("/")) {
        searchInput.value = searchInput.value.replace("/", "");
    }
    const results = await comboGqlFetch(searchInput.value);
    let allResults = [];
    // stash pages
    allResults = allResults.concat(
        pages.map((page) => ({
            id: page,
            label: page,
            url: "/" + page,
            type: "system",
        }))
    );
    
    // stash settings tabs
    allResults = allResults.concat(
        settingsTabs.map((tab) => ({
            id: tab,
            label: "settings -> " + tab,
            url: "/settings?tab=" + tab,
            type: "system",
        }))
    );
    
    // add combo results
    allResults = allResults.concat(results);
    
    // lets fuzzy the results to get a bit more accurate
    const fuse = new Fuse(allResults, {
        keys: [
            { name: "label", weight: 10 },
            { name: "aliases", weight: 5 },
            { name: "details", weight: 1 },
        ],
        shouldSort: true,
        threshold: 0.4,
    });
    
    // limit results
    allResults = fuse
    .search(searchInput.value, { limit: maxResultsDisplayed })
    .map((r) => r.item);
    
    // display results
    displayResults(allResults.sort((a, b) => a.label.localeCompare(b.label)));
}

searchInput.addEventListener(
    "input",
    debounce((e) => searchAndDisplay(e), 100)
); // Adjust the delay as needed

document.addEventListener("keydown", (e) => {
    // on cmd + / , focus the search input
    if (e.key === "/" && e.metaKey) {
        // add visible class to the omnisearch
        omnisearch.classList.add("visible");
        searchInput.focus();
        // on escape, unfocus the search input and clear it
    } else if (e.key === "Escape") {
        // remove visible class from the omnisearch
        omnisearch.classList.remove("visible");
        searchInput.blur();
        searchInput.value = "";
    }
});

const openResult = (result) => {
    const searchTypes = [
        "performer",
        "scene",
        "tag",
        "scene",
        "studio",
    ];
    if (result.type === "system")
        return (window.location.href = result.url);
    else if (!searchTypes.includes(result.type)) return;
    window.location.href = `/${result.type}s/${result.id}`;
};

const createResult = (result) => {
    const allResultDivs = document.querySelectorAll(".omnisearch-result");
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("omnisearch-result");
    resultDiv.addEventListener("click", (e) => openResult(result));
    
    // support tabbing
    resultDiv.tabIndex = 0;
    
    // support enter key
    resultDiv.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "Enter":
            openResult(result);
            break;
            case " ":
            e.preventDefault();
            [...allResultDivs].map(r =>
                r.setAttribute("class", "omnisearch-result")
            );
            resultDiv.classList.toggle("expanded");
            break;
            default:
            break;
        }
        // e.key === "Enter" && openResult(result)
    });
    
    const resultHeader = document.createElement("div");
    resultHeader.classList.add("omnisearch-result-header");
    
    const resultType = document.createElement("div");
    resultType.classList.add("omnisearch-result-type");
    resultType.textContent = `[${result.type[0]}]`;
    resultHeader.appendChild(resultType);
    
    const resultTitle = document.createElement("div");
    resultTitle.classList.add("omnisearch-result-title");
    resultTitle.textContent = result.label;
    resultTitle.title = result?.details ? result.details : "";
    resultHeader.appendChild(resultTitle);

    const resultDetails = document.createElement("div");
    resultDetails.classList.add("omnisearch-result-details");
    resultDetails.textContent = result?.details ? result.details : "";
    resultDiv.appendChild(resultDetails);

    const resultImage = document.createElement("video");
    resultImage.classList.add("omnisearch-result-image");
    resultImage.src = result.image;
    resultImage.poster = result.image
    resultImage.autoplay = true;
    resultImage.loop = true;
    resultImage.muted = true;
    resultDiv.appendChild(resultImage);

    resultDiv.appendChild(resultHeader);
    return resultDiv;
};

const displayResults = (results) => {
    searchResults.innerHTML = "";
    results.forEach((result) => {
        searchResults.appendChild(createResult(result));
    });
};
