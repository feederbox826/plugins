async function addAvgRating() {
    const fetchAverage = (query, variables) => fetch("/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables })
        }).then(res => res.json())
        .then(data => data.data.findScenes.scenes
            .map(scene => scene.rating100)
            .reduce((acc, rating) => acc + rating, 0) / data.data.findScenes.scenes.length
        ).then(avg => Math.round(avg))

    function fetchMovieRating(id) {
        // craft query
        const query = `query FindScenes($movie: ID!) {
        findScenes( scene_filter: {
            movies: {value: [$movie], modifier: INCLUDES_ALL }
            rating100: { modifier: NOT_NULL, value: 0 }}) {
        scenes { rating100 }}}`
        // fetch data
        return fetchAverage(query, { movie: id })
    }
    function fetchPerformerRating(id) {
        // craft query
        const query = `query FindScenes($performer: ID!) {
        findScenes( scene_filter: {
            performers: { value: [$performer], modifier: INCLUDES_ALL }
            rating100: { modifier: NOT_NULL, value: 0 }}) {
        scenes { rating100 }}}`
        // fetch data
        return fetchAverage(query, { performer: id })
    }
    function fetchStudioRating(id) {
        // craft query
        const query = `query FindScenes($studio: ID!) {
        findScenes( scene_filter: {
            rating100: { modifier: NOT_NULL, value: 0 }
            studios: { value: [$studio], modifier: INCLUDES, depth: -1 }} ) {
        scenes { rating100 }}}`
        // fetch data
        return fetchAverage(query, { studio: id })
    }
    function setRatingElement(rating) {
        if (document.querySelector(".avg-rating")) return
        // create element
        const ratingParent = document.createElement("div")
        ratingParent.classList = "detail-item avg-rating"
        const ratingTitle = document.createElement("span")
        ratingTitle.classList = "detail-item-title avg-rating"
        ratingTitle.innerText = "Avg Rating"
        ratingParent.appendChild(ratingTitle)
        const ratingValue = document.createElement("span")
        ratingValue.classList = "detail-item-value avg-rating"
        // If the rating is not a number, return "N/A" instead of a percentage.
        ratingValue.innerText = Number.isNaN(rating) ? "N/A" : `${rating}%`
        ratingParent.appendChild(ratingValue)
        // append to navbar
        document.querySelector(".detail-group").prepend(ratingParent)
    }
    // set ratings
    function setRating() {
        if (document.querySelector(".avg-rating")) return
        // look for performer id
        const performerId = window.location.pathname.match(/\/performers\/(\d+)/)
        // look for studio id
        const studioId = window.location.pathname.match(/\/studios\/(\d+)/)
        // look for movie id
        const movieId = window.location.pathname.match(/\/movies\/(\d+)/)
        // set rating
        if (performerId) fetchPerformerRating(performerId[1]).then(rating => setRatingElement(rating))
        else if (studioId) fetchStudioRating(studioId[1]).then(rating => setRatingElement(rating))
        else if (movieId) fetchMovieRating(movieId[1]).then(rating => setRatingElement(rating))
    }
    // change observer
    PluginApi.Event.addEventListener("stash:location", () => setRating())
    wfke("#studio-page, #performer-page", "#movie-page", setRating)
}
addAvgRating()