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

        this.minYear = "2010"
        this.maxYear = "2022"

        this.updateData()

        this.scaleX = d3.scaleTime().domain([new Date(this.minYear), new Date(this.maxYear)]).range([this.margins.left, this.visWidth - this.margins.right])
        this.scaleY = d3.scaleLinear().domain([0, yMax]).range([this.visHeight - this.margins.bottom - this.margins.top, this.margins.bottom]).nice()
        this.colorScale = d3.scaleOrdinal().domain(this.globalApplicationState.selectedGenres).range(d3.schemeCategory10)
        this.svg = d3.select("#bump-chart").attr("width", this.visWidth).attr("height", this.visHeight)

        this.drawAxis()
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
        this.chartData = d3.group(rankings, d=>d.genre)
    }

    update() {
        this.colorScale = d3.scaleOrdinal().domain(this.globalApplicationState.selectedGenres).range(d3.schemeCategory10)
        this.updateData()
        this.drawAxis()
    }

    drawAxis() {
        let xSelection = this.svg.select("#x-axis")
        let ySelection = this.svg.select("#y-axis")
        
        let xAxis = d3.axisBottom(this.scaleX)

        ySelection.selectAll("text")
            .data(this.globalApplicationState.selectedGenres)
            .join("text")
            .attr("x", 30)
            .attr("y", (d,i) => this.margins.left + 60 + i * (450/this.globalApplicationState.selectedGenres.length))
            .text(d => d)

        let labels = this.svg.append("g").attr("id", "axis-labels")
        labels.append("text").text("Year Released").attr("x", this.visWidth/2).attr("y", this.visHeight)
        labels.append("text").text("Popularity").attr("x", -this.visHeight/2 - this.margins.top).attr("y", 15).attr("transform", "rotate(-90)")

        xSelection.attr("transform", `translate(50, ${this.visHeight - this.margins.top})`).call(xAxis)
    }

    drawCircles() {
        
    }
}