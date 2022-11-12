// Data Loading
async function loadData() {
    const seasonData = await d3.json('data/small_anime_seasons.json')
    const genreData = await d3.json('data/small_anime_genres.json')
    return [seasonData, genreData]
}

// Data used throughout our application
const globalApplicationState =  {
    seasonData: null,
    genreData: null,
    genres: ["Action", "Adventure", "Avant Garde", "Boys Love", "Comedy", "Drama", 
             "Fantasy", "Girls Love", "Gourmet", "Horror", "Mystery", "Romance", 
             "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Suspense"],
    selectedGenres: [],
}

// Application Mounting
loadData().then((loadedData => { 
    const [seasonData, genreData] = loadedData
    globalApplicationState.seasonData = seasonData
    globalApplicationState.genreData = genreData

    lineChart = LineChart(globalApplicationState)
    barGraph = BarGraph(globalApplicationState) 
}))