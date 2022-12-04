class BumpChart {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState

        this.visWidth = 1000
        this.visHeight = 600

        this.margins = {left: 50, right: 20, top: 50, bottom: 40}

        this.years = Array.from(this.globalApplicationState.seasonData.keys())
        this.years.sort()
        let yMax = d3.max(this.years, d => {
            let data = this.globalApplicationState.seasonData.get(d)
            return d3.max(Object.values(data.genre_counts))
        })

        this.minYear = this.years[0]
        this.maxYear = "2022"

        this.scaleX = d3.scaleTime().domain([new Date(this.minYear), new Date(this.maxYear)]).range([this.margins.left, this.visWidth - this.margins.right])
        this.scaleY = d3.scaleLinear().domain([0, yMax]).range([this.visHeight - this.margins.bottom - this.margins.top, this.margins.bottom]).nice()
        this.colorScale = d3.scaleOrdinal().domain(this.globalApplicationState.selectedGenres).range(d3.schemeCategory10)
        this.svg = d3.select("#bump-chart").attr("width", this.visWidth).attr("height", this.visHeight)

        this.drawAxis()
    }

    update() {
        this.colorScale = d3.scaleOrdinal().domain(this.globalApplicationState.selectedGenres).range(d3.schemeCategory10)
        this.drawAxis()
    }

    drawAxis() {
        let xSelection = this.svg.select("#x-axis")
        let ySelection = this.svg.select("#y-axis")
        
        let xAxis = d3.axisBottom(this.scaleX)

        ySelection.selectAll("text")
            .data(this.globalApplicationState.selectedGenres)
            .join("text")
            .attr("x", 10)
            .attr("y", (d,i) => this.margins.left + 10 + i * (500/this.globalApplicationState.selectedGenres.length))
            .text(d => d)

        let labels = this.svg.append("g").attr("id", "axis-labels")
        labels.append("text").text("Year Released").attr("x", this.visWidth/2).attr("y", this.visHeight)
        labels.append("text").text("Popularity").attr("x", -this.visHeight/2 - this.margins.top).attr("y", 15).attr("transform", "rotate(-90)")

        xSelection.attr("transform", `translate(0, ${this.visHeight - this.margins.top})`).call(xAxis)
    }

}