class BumpChart {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState

        this.visWidth = 1000
        this.visHeight = 600

        this.margins = {left: 130, right: 20, top: 50, bottom: 60}

        this.minYear = "2010"
        this.maxYear = "2022"

        this.updateData()

        this.scaleX = d3.scaleTime().domain([new Date(this.minYear), new Date(this.maxYear)]).range([this.margins.left, this.visWidth - this.margins.right])
        this.scaleY = d3.scaleLinear().domain([0, this.globalApplicationState.selectedGenres.length]).range([this.margins.top, this.visHeight - this.margins.bottom - this.margins.top]).nice()
        this.colorScale = d3.scaleOrdinal().domain(this.globalApplicationState.selectedGenres).range(d3.schemeCategory10)
        this.svg = d3.select("#bump-chart").attr("width", this.visWidth).attr("height", this.visHeight)

        this.drawAxis()
        this.drawSeries()
    }

    updateData() {
        let genreGrouped = new Map()
        this.globalApplicationState.genreData.forEach((value,key) => {genreGrouped.set(key, [...d3.rollup(value, v => d3.mean(v, a => a.popularity), d => d.year)])})
        let filtered = ([...genreGrouped].filter(([k,v]) => this.globalApplicationState.selectedGenres.includes(k)))

        this.bumpData = new Map()
        let filteredAvgs = new Array()
        filtered.forEach(([k, v]) => {
            v.sort((a,b) => {
                return new Date(a[0]) - new Date(b[0])
            })
            v.forEach(([k2,v2])=> {
                if(k2 >= this.minYear && k2 <= this.maxYear)
                {
                    filteredAvgs.push({
                        genre: k,
                        year: k2,
                        avg: v2
                    })
                }
            })
        })
        let rankings = new Array()
        let groupByYear = d3.group(filteredAvgs, d => d.year)
        groupByYear.forEach(d => {
            d.sort((a,b) => a.avg - b.avg)
            d.forEach((d, i) => rankings.push({
                genre: d.genre,
                year: d.year,
                ranking: i
            }))
        })
        this.left = rankings.filter(d => d.year === this.minYear)
        this.right = rankings.filter(d => d.year === this.maxYear)
        this.chartData = rankings
    }

    update() {
        this.scaleY = d3.scaleLinear().domain([0, this.globalApplicationState.selectedGenres.length]).range([this.margins.top, this.visHeight - this.margins.bottom - this.margins.top]).nice()
        this.colorScale = d3.scaleOrdinal().domain(this.globalApplicationState.selectedGenres).range(d3.schemeCategory10)
        this.updateData()
        this.drawAxis()
        this.drawSeries()
    }

    drawAxis() {
        let xSelection = this.svg.select("#x-axis")
        let ySelection = this.svg.select("#y-axis")
        
        let xAxis = d3.axisBottom(this.scaleX)
        ySelection.selectAll("text")
            .data(this.left)
            .join("text")
            .attr("x", 30)
            .transition()
            .attr("y", (d,i) => this.scaleY(d.ranking))
            .attr("transform", `translate(0, ${this.margins.bottom})`)
            .text(d => d.genre)

        let labels = this.svg.append("g").attr("id", "axis-labels")
        labels.append("text").text("Year Released").attr("x", this.visWidth/2).attr("y", this.visHeight)
        labels.append("text").text("Average Popularity").attr("x", this.visWidth/2).attr("y", 50)

        xSelection.attr("transform", `translate(0, ${this.visHeight - this.margins.top})`).call(xAxis)
    }
    
    drawSeries(){
        let grouped = d3.group(this.chartData, d => d.genre)
        let seriesGroup = d3.select("#series")
            .selectAll("g")
            .data(grouped)
            .join("g")
            .attr("transform", `translate(0, ${this.margins.bottom })`)

        let circ = circGroup.selectAll('circle')
        .data(d=>d[1])
        .join('circle')
            .attr('cx', d => this.scaleX(new Date(d.year)))
            .attr('r', 15)
            .attr('fill', d => this.colorScale(d.genre))
            .attr('cy', d => this.scaleY(d.ranking))
        let text = selection.selectAll('text')  
            .data(d=>d[1])
            .join('text')
            .text(d => d.ranking + 1)
            .attr('dx', d => this.scaleX(new Date(d.year)))
            .attr('dy', d => this.scaleY(d.ranking))
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('fill', 'white')
    }

    drawLines(selection) {
        let lineGenerator = d3.line()
            .x(d => { return this.scaleX(new Date(d.year)) })
            .y(d => { return this.scaleY(d.ranking) })
        selection.selectAll("path")
            .data(d=>{ return [d[1]] })
            .join("path")
            .attr("d", d => { return lineGenerator(d)})
            .attr("fill", "none")
            .attr("stroke", d => this.colorScale(d[0].genre))
            .attr("stroke-width", 10)
    }
}