class LineChart {
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
        this.svg = d3.select("#line-chart").attr("width", this.visWidth).attr("height", this.visHeight)

        this.updateFilteredData()
        this.drawAxis()
        this.drawLegend()
        this.drawLines()
        this.drawInteraction()
    }

    update() {
        this.colorScale = d3.scaleOrdinal().domain(this.globalApplicationState.selectedGenres).range(d3.schemeCategory10)
        this.updateFilteredData()
        this.drawLines()
        this.drawLegend()
        this.drawInteraction()
    }

    updateFilteredData() {
        let genreGrouped = new Map()
        this.globalApplicationState.genreData.forEach((value,key) => {genreGrouped.set(key, [...d3.group(value, d => d.year)])})
        let filtered = ([...genreGrouped].filter(([k,v]) => this.globalApplicationState.selectedGenres.includes(k)))
        filtered.forEach(([k, v]) => {
            for(let i = this.minYear; i < this.maxYear; i++)
            {
                let year = i.toString()
                let sameYear = v.filter(d => d[0] === year)
                
                if(sameYear.length === 0)
                    v.push([year, []])  
            }
            v.sort((a,b) => {
                return new Date(a[0]) - new Date(b[0])
            })
        })

        this.filteredYears = new Map(filtered)
    }

    drawLegend() {
        let legendSelection = this.svg.select("#legend")
        
        legendSelection.selectAll("rect")
            .data(this.globalApplicationState.selectedGenres)
            .join("rect")
            .attr("x", (d,i) => this.margins.left + i * 150)
            .attr("y", this.margins.top)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => this.colorScale(d))
        legendSelection.selectAll("text")
            .data(this.globalApplicationState.selectedGenres)
            .join("text")
            .attr("x", (d,i) => this.margins.left + 20 + i * 150)
            .attr("y", this.margins.top + 10)
            .text(d => d)
    }

    drawAxis() {
        let xSelection = this.svg.select("#x-axis")
        let ySelection = this.svg.select("#y-axis")
        
        let xAxis = d3.axisBottom(this.scaleX)
        let yAxis = d3.axisLeft(this.scaleY)

        let labels = this.svg.append("g").attr("id", "axis-labels")
        labels.append("text").text("Year Released").attr("x", this.visWidth/2).attr("y", this.visHeight)
        labels.append("text").text("Number of Shows").attr("x", -this.visHeight/2 - this.margins.top).attr("y", 15).attr("transform", "rotate(-90)")

        xSelection.attr("transform", `translate(0, ${this.visHeight - this.margins.top})`).call(xAxis)
        ySelection.attr("transform", `translate(${this.margins.left}, ${this.margins.bottom})`).call(yAxis)
    }

    drawLines() {
        let lineSelection = this.svg.select("#lines")
        let lineGenerator = d3.line()
            .x(d => { return this.scaleX(new Date(d[0])) })
            .y(d => { return this.scaleY(d[1].length) })

        let genreGrouped = new Map()
        this.globalApplicationState.genreData.forEach((value,key) => {genreGrouped.set(key, [...d3.group(value, d => d.year)])})
        let filtered = ([...genreGrouped].filter(([k,v]) => this.globalApplicationState.selectedGenres.includes(k)))
        filtered.forEach(([k, v]) => {
            for(let i = this.minYear; i < this.maxYear; i++)
            {
                let year = i.toString()
                let sameYear = v.filter(d => d[0] === year)
                
                if(sameYear.length === 0)
                    v.push([year, []])  
            }
            v.sort((a,b) => {
                return new Date(a[0]) - new Date(b[0])
            })
        })

        let filteredMap = new Map(filtered)

        lineSelection.selectAll("path")
            .data(this.filteredYears)
            .join("path")
            .attr("d", d => lineGenerator(d[1]))
            .attr("transform", `translate(0, ${this.margins.bottom })`)
            .attr("fill", "none")
            .attr("stroke", d => this.colorScale(d[0]))
            .attr("stroke-width", 1)
            
    }

    drawInteraction() {
        let overlaySelection = this.svg.select("#overlay")
        
        this.svg.on("mousemove", (event) => {
            let rightbound = this.visWidth - this.margins.right

            if(event.offsetX > this.margins.left && event.offsetX < rightbound) {
                overlaySelection.select("line")
                    .attr("stroke", "black")
                    .attr("x1", event.offsetX)
                    .attr("x2", event.offsetX)
                    .attr("y1", this.visHeight - this.margins.bottom)
                    .attr("y2", this.margins.top + 20)

                const yearHovered = this.scaleX.invert(event.offsetX).getFullYear().toString()
                const filteredData = new Map([...this.filteredYears].map(([k,v]) => { let filtered = v.filter(([k2,v2]) => { return k2 === yearHovered }); return [k, filtered] }))
                overlaySelection.selectAll("text").remove()    

                overlaySelection.selectAll("text")
                    .data(filteredData)
                    .join("text")
                    .text(d => `${d[0]} ${d[1][0][1].length} show${d[1][0][1].length === 1 ? "" : "s"}`)
                    .attr("x", (event.offsetX > 3/4 * this.visWidth) ? (event.offsetX - 150) : (event.offsetX + 5))
                    .attr("y", (d, i) => i * 20 + this.margins.top + 40)
                    .attr("alignment-baseline", "hanging")
                    .attr("stroke",d => this.colorScale(d[0]))
                    .attr("stroke-width", 0.2)
                    .attr("fill", d => this.colorScale(d[0]))

                overlaySelection.append("text")
                    .text(yearHovered)
                    .attr("x", (event.offsetX > 3/4 * this.visWidth) ? (event.offsetX - 150) : (event.offsetX + 5))
                    .attr("y", this.margins.top + 20)
                    .attr("alignment-baseline", "hanging")
                    .attr("fill", "black")

            }

        })
    }
}