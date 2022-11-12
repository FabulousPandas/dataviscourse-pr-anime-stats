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
    selectedGenres: ["Action", "Comedy", "Drama", "Romance"],
}

// Application Mounting
loadData().then((loadedData => { 
    const [seasonData, genreData] = loadedData
    globalApplicationState.seasonData = seasonData
    globalApplicationState.genreData = genreData

    //lineChart = new LineChart(globalApplicationState)
    barGraph = new BarGraph(globalApplicationState)

    d3.select("#filters")
        .selectAll("input")
        .data(globalApplicationState.genres)
        .enter()
        .append("label")
            .text((d) => d)
        .append("input")
            .attr("type", "checkbox")
            .attr("id", (d) => d = d.replace(/\s/g, ''))
            .property("checked", (d) => globalApplicationState.selectedGenres.includes(d))
            .classed("unchecked", (d) => !globalApplicationState.selectedGenres.includes(d))
            .on("click", (d, genre) => {
                genre_id = genre.replace(/\s/g, '')
                const index = globalApplicationState.selectedGenres.indexOf(genre);
                if (index > -1) {
                    globalApplicationState.selectedGenres.splice(index, 1)
                    d3.select("#" + genre_id).classed("unchecked", true)
                } else {
                    globalApplicationState.selectedGenres.push(genre)
                    d3.select("#" + genre_id).classed("unchecked", false)
                }
                if(globalApplicationState.selectedGenres.length >= 10)
                    d3.selectAll(".unchecked").property("disabled", true);
                else
                    d3.selectAll(".unchecked").property("disabled", false);
                barGraph.draw()
            })
}))