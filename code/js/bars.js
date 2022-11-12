class BarGraph {
    
    constructor(globalState) {
        this.globalState = globalState;
        this.genreData = globalState.genreData;
        this.visWidth = 500;
        this.visHeight = 500;

        this.genreList = [];
        for (let genre of Object.keys(this.genreData)) {
            if (!globalState.genres.includes(genre)) {
                delete this.genreData[genre];
            }
        }

        d3.select("#bar-graph").attr("width", this.visWidth).attr("height", this.visHeight)
        
        this.draw()
    }

    draw() {
        console.log(this.genreData)
        this.scaleX = d3.scaleBand()
            .domain(this.genreList)
            .range([0, 500])
        this.scaleY = d3.scaleLinear()
            .domain([0, d3.max(this.genreData, (d) => len(d.anime))])
            .range([500, 0])
        this.drawAxes()
    }

    drawAxes() {
        let xAxis = d3.axisBottom(this.scaleX)
        d3.select("#bar-graph").append("g").attr("id", "axes")
    }
}