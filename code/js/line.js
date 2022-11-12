class LineChart {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState

        this.visWidth = 1500
        this.visHeight = 600

        this.margins = {left: 20, right: 20, top: 20, bottom: 20}

        this.globalApplicationState.selectedGenres = ["Action", "Adventure", "Romance", "Slice of Life"]

        this.seasons = Object.keys(this.globalApplicationState.seasonData)
        this.seasons.sort(this.sortSeason)
        let yMax = d3.max(this.seasons, d => {
            let data = this.globalApplicationState.seasonData[d]
            return d3.sum(Object.values(data.genre_counts))
        })

        this.scaleX = d3.scalePoint().domain(this.seasons).range([this.margins.left, this.visWidth - this.margins.right])
        this.scaleY = d3.scaleLinear().domain([0, yMax]).range([this.visHeight - this.margins.bottom - this.margins.top, 0]).nice()
        this.colorScale = d3.scaleOrdinal().domain(this.globalApplicationState.selectedGenres).range(d3.schemeCategory10)
        this.svg = d3.select("#line-chart").attr("width", this.visWidth).attr("height", this.visHeight)

        this.drawAxis()
        this.drawLines()
    }

    sortSeason(a, b){ 
        let seasonValue = {"Spring": 0, "Summer": 1, "Fall": 2, "Winter": 3}
        let [a_season, a_year] = a.split(" ")
        let [b_season, b_year] = b.split(" ")
        if(a_year < b_year)
            return -1
        else if (a_year > b_year)
            return 1
        else {
            if (seasonValue[a_season] < seasonValue[b_season])
                return -1
            else
                return 1
        }
    }

    update() {
        this.colorScale = d3.scaleOrdinal().domain(this.globalApplicationState.selectedGenres).range(d3.schemeCategory10)
        this.drawLines()
        this.drawLegend()
    }

    drawLegend() {

    }

    drawAxis() {
        let xSelection = this.svg.select("#x-axis")
        let ySelection = this.svg.select("#y-axis")
        
        let xAxis = d3.axisBottom(this.scaleX)
        let yAxis = d3.axisLeft(this.scaleY)

        xSelection.attr("transform", `translate(0, ${this.visHeight - this.margins.top})`).call(xAxis)
        ySelection.attr("transform", `translate(${this.margins.left}, ${this.margins.bottom})`).call(yAxis)
    }

    drawLines() {
        let lineSelection = this.svg.select("#lines")
        let lineGenerator = d3.line()
            .x(d => { return this.scaleX(d[0]) })
            .y(d => { return this.scaleY(d[1].length) })

        let genreGrouped = new Map()
        this.globalApplicationState.genreData.forEach((value,key) => {genreGrouped.set(key, [...d3.group(value, d => d.season)])})
        let filtered = ([...genreGrouped].filter(([k,v]) => this.globalApplicationState.selectedGenres.includes(k)))
        filtered.forEach(([k, v]) => {
            v.sort((a,b) => {
                return this.sortSeason(a[0], b[0])
            })
        })

        let filteredMap = new Map(filtered)

        lineSelection.selectAll("path")
            .data(filteredMap)
            .join("path")
            .attr("d", d => lineGenerator(d[1]))
            .attr("transform", `translate(0, ${this.margins.top})`)
            .attr("fill", "none")
            .attr("stroke", d => this.colorScale(d[0]))
            .attr("stroke-width", 1)
            // this.colorScale("Action"))
            

    }
}