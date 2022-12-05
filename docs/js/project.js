// Data Loading
async function loadData() {
    const seasonData = await d3.json('data/anime_years.json')
    const genreData = await d3.json('data/anime_genres.json')
    return [seasonData, genreData]
}

const selected = ["Action", "Comedy", "Drama", "Romance"];

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
            "Idols (Male)", "Isekai", "Iyashikei", "Love Polygon", "Magical Sex Shift",
            "Mahou Shoujo", "Martial Arts", "Mecha", "Medical", "Military", "Music",
            "Mythology", "Organized Crime", "Otaku Culture", "Parody", "Performing Arts",
            "Pets", "Psychological", "Racing", "Reincarnation", "Reverse Harem",
            "Romantic Subtext", "Samurai", "School", "Showbiz", "Space", "Strategy Game",
            "Super Power", "Survival", "Team Sports", "Time Travel", "Vampire", "Video Game",
            "Visual Arts", "Workplace"],
    demographics: ["Josei", "Kids", "Seinen", "Shoujo", "Shounen"],
    selectedGenres: selected,
    colorScale: null,
}

// Application Mounting
loadData().then((loadedData => { 
    const [seasonData, genreData] = loadedData
    globalApplicationState.seasonData = new Map(seasonData)
    globalApplicationState.genreData = new Map(genreData)
    updateColors();

    let lineChart = new LineChart(globalApplicationState)
    let barGraph = new BarGraph(globalApplicationState)
    let bumpChart = new BumpChart(globalApplicationState)

    d3.select("#filters") .append("text").text("Genres:")
    create_checkboxes(globalApplicationState.genres, lineChart, barGraph, bumpChart)

    d3.select("#filters").append("text").text("Themes:")
    create_checkboxes(globalApplicationState.themes, lineChart, barGraph, bumpChart)

    d3.select("#filters") .append("text").text("Demographics:")
    create_checkboxes(globalApplicationState.demographics, lineChart, barGraph, bumpChart)
}))

function create_checkboxes(data, lineChart, barGraph, bumpChart) {
    let div = d3.select("#filters")
                .append("g")
                .selectAll("input")
                .data(data)
                .enter()
                .append("div");
    let label = div.append("label");
    label.classed("switch", true);
    label.append("input")
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
            updateColors()
            lineChart.update()
            barGraph.draw()
            bumpChart.update()
        });
    label.append("span").classed("slider round", true)
    div.append("label").classed("slider-label", true).text((d) => d);
}

function updateColors() {
    globalApplicationState.colorScale = d3.scaleOrdinal().domain(selected).range(d3.schemeCategory10);
    drawLegend();
}

function drawLegend() {
    let legendSelection = d3.select("#legend")
    
    legendSelection.selectAll("rect")
        .data(globalApplicationState.selectedGenres)
        .join("rect")
        .attr("x", (d,i) => 10 + (i % 5) * 150)
        .attr("y", (d, i) => i < 5 ? 5 : 30)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => globalApplicationState.colorScale(d))
    legendSelection.selectAll("text")
        .data(globalApplicationState.selectedGenres)
        .join("text")
        .attr("x", (d,i) => 30 + (i % 5) * 150)
        .attr("y", (d, i) => i < 5 ? 15 : 40)
        .text(d => d)
}
