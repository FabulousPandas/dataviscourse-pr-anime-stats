// Data Loading
async function loadData() {
    const animeData = await d3.json('data/template.json')
    return animeData
}

// Data used throughout our application
const globalApplicationState =  {
    animeData: null,
    genres: ["Action", "Adventure", "Avant Garde", "Boys Love", "Comedy", "Drama", 
             "Fantasy", "Girls Love", "Gourmet", "Horror", "Mystery", "Romance", 
             "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Suspense"],
    selectedGenres: [],
}

// Application Mounting
loadData().then((loadedData => { 
    globalApplicationState.animeData = loadedData

    lineChart = LineChart(globalApplicationState)
    
}))