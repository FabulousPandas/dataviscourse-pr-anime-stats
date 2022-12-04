class BarGraph {
    
    constructor(globalState) {
        this.globalState = globalState;
        this.visWidth = 1000;
        this.visHeight = 450;
        this.marginX = 50;
        this.marginTop = 10;
        this.marginBottom = 30;

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
            .range([this.visHeight - this.marginBottom, this.marginTop]).nice()
        this.colorScale = d3.scaleOrdinal().domain(this.globalState.selectedGenres).range(d3.schemeCategory10)
        this.drawAxes()
        this.drawBars()
    }

    drawAxes() {
        d3.select("#axis-labels").remove();
        let xAxis = d3.axisBottom(this.scaleX);
        let yAxis = d3.axisLeft(this.scaleY);

        let labels = d3.select("#bar-graph").append("g").attr("id", "axis-labels");
        labels.append("text").text("Genre").attr("x", this.visWidth/2).attr("y", this.visHeight)
        labels.append("text").text("Number of Shows").attr("x", -this.visHeight/2 - this.marginTop).attr("y", 15).attr("transform", "rotate(-90)")

        d3.select("#bar-x-axis").call(xAxis).attr("transform", "translate(0, " + (this.visHeight - this.marginBottom) + ")");
        d3.select("#bar-y-axis").call(yAxis).attr("transform", "translate(" + this.marginX + ", 0" + ")");
    }

    drawBars() {
        d3.select("#bars").selectAll("rect").remove()
        d3.select("#bars")
            .selectAll("rect")
            .data(this.genreData)
            .join("rect")
                .attr("x", (d) => this.scaleX(d[0]) + this.marginX - 20)
                .attr("y", (d) => this.scaleY(d[1].length))
                .attr("width", this.scaleX.bandwidth() - (this.marginX - 20) * 2)
                .attr("height", (d) => this.visHeight - this.scaleY(d[1].length) - this.marginBottom)
                .attr("fill", (d) => this.colorScale(d[0]))
    }
}