class BarGraph {
    
    constructor(globalState) {
        this.globalState = globalState;
        this.visWidth = 1000;
        this.visHeight = 310;
        this.marginX = 50;
        this.marginY = 20;

        d3.select("#bar-graph").attr("width", this.visWidth).attr("height", this.visHeight)
        
        this.draw()
    }

    draw() {
        this.genreList = this.globalState.selectedGenres;
        this.genreData = []
        for (let genre of this.globalState.genreData) {
            if (this.genreList.includes(genre[0])) {
                this.genreData.push(genre)
            }
        }
        this.scaleX = d3.scaleBand()
            .domain(this.genreList)
            .range([this.marginX, this.visWidth - this.marginX])
        this.scaleY = d3.scaleLinear()
            .domain([0, d3.max(this.genreData, (d) => d[1].length)])
            .range([this.visHeight, 0])
        this.colorScale = d3.scaleOrdinal().domain(this.globalState.selectedGenres).range(d3.schemeCategory10)
        this.drawAxes()
        this.drawBars()
    }

    drawAxes() {
        let xAxis = d3.axisBottom(this.scaleX);
        let yAxis = d3.axisLeft(this.scaleY);
        d3.select("#bar-x-axis").call(xAxis).attr("transform", "translate(0, " + (this.visHeight - this.marginY) + ")");
        d3.select("#bar-y-axis").call(yAxis).attr("transform", "translate(" + this.marginX + ", " + -this.marginY + ")");
    }

    drawBars() {
        d3.select("#bars").selectAll("rect").remove()
        d3.select("#bars")
            .selectAll("rect")
            .data(this.genreData)
            .join("rect")
                .attr("x", (d) => this.scaleX(d[0]) + this.marginX)
                .attr("y", (d) => this.scaleY(d[1].length))
                .attr("width", this.scaleX.bandwidth() - 100)
                .attr("height", (d) => this.visHeight - this.scaleY(d[1].length) - this.marginY)
                .attr("fill", (d) => this.colorScale(d[0]))
    }
}