class LineChart {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState

        this.visWidth = 1500
        this.visHeight = 600

        this.margins = {left: 20, right: 20, top: 20, bottom: 20}

        this.globalApplicationState.selectedGenres = ["Action", "Adventure", "Romance", "Slice of Life"]

        this.seasons = Object.keys(this.globalApplicationState.seasonData)
        let seasonValue = {"Spring": 0, "Summer": 1, "Fall": 2, "Winter": 3}
        this.seasons.sort((a, b) => {
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
        })
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
        // console.log(this.seasons)
        let lineGenerator = d3.line()
            .x(d => { console.log(d); return this.scaleX(d)})
            .y(d => this.scaleY(d3.sum(Object.values(this.globalApplicationState.seasonData[d].genre_counts))))
            // .y(d => this.scaleY(d3.sum(Object.values(this.globalApplicationState.seasonData[d].genre_counts))))
                // this.scaleY(d3.sum(Object.values(this.globalApplicationState.seasonData[d].genre_counts))))
        // console.log(lineGenerator)
        // let pathSelection = lineSelection.select("path")
        // console.log(this.globalApplicationState.selectedGenres)
        let groupTest = d3.group(Object.entries(this.globalApplicationState.genreData), d => {console.log(Object.values(d[1])[1].season);})
        console.log(groupTest)
        
        lineSelection.selectAll("path")
            .data(this.selectedGenres)
            .join("path")
            .attr("d", lineGenerator)
            // .attr("transform", `translate(${this.margins.left}, ${this.visHeight - this.margins.top})`)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            // this.colorScale("Action"))
            

    }
}