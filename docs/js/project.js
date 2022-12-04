// Data Loading
async function loadData() {
    const seasonData = await d3.json('data/anime_years.json')
    const genreData = await d3.json('data/anime_genres.json')
    return [seasonData, genreData]
}

// Data used throughout our application
const globalApplicationState =  {
    seasonData: null,
    genreData: null,
    genres: ["Action", "Adventure", "Avant Garde", "Boys Love", "Comedy", "Drama", 
             "Fantasy", "Girls Love", "Gourmet", "Horror", "Mystery", "Romance", 
             "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Suspense"],
    themes: ["Adult Cast", "Anthropomorphic", "CGDCT", "Childcare", "Combat Sports",
            "Crossdressing", "Delinquents", "Detective", "Educational", "Gag Humor",
            "Gore", "Harem", "High Stakes Game", "Historical", "Idols (Female)",
            "Idols (Male)", "Isekai"],
    selectedGenres: ["Action", "Comedy", "Drama", "Romance"],
}

// Application Mounting
loadData().then((loadedData => { 
    const [seasonData, genreData] = loadedData
    globalApplicationState.seasonData = new Map(seasonData)
    globalApplicationState.genreData = new Map(genreData)

    let lineChart = new LineChart(globalApplicationState)
    let barGraph = new BarGraph(globalApplicationState)

    d3.select("#filters") .append("text").text("Genres:")
    create_checkboxes(globalApplicationState.genres, lineChart, barGraph)

    d3.select("#filters").append("text").text("Themes:")
    create_checkboxes(globalApplicationState.themes, lineChart, barGraph)
}))

function create_checkboxes(data, lineChart, barGraph) {
    d3.select("#filters")
        .append("g")
        .selectAll("input")
        .data(data)
        .enter()
        .append("label")
            .text((d) => d)
        .append("input")
            .attr("type", "checkbox")
            .attr("id", (d) => d = d.replace(/\s/g, ''))
            .property("checked", (d) => globalApplicationState.selectedGenres.includes(d))
            .classed("unchecked", (d) => !globalApplicationState.selectedGenres.includes(d))
            .on("click", (d, genre) => {
                genre_id = genre.replace(/[^A-Za-z\d]/g, '')
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
                lineChart.update()
                barGraph.draw()
            })
}