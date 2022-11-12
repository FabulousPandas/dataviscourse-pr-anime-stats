class LineChart {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState

        this.visWidth = 1000
        this.visHeight = 1000

        this.margins = {left: 10, right: 10, top: 20, bottom: 20}

        let seasons = this.globalApplicationState.seasonData
        console.log(seasons)

        this.scaleX = d3.scaleBand().domain().range([this.margins.left, this.visWidth - this.margins.right])
        this.scaleY = d3.scaleLinear().domain().range([this.margins.bottom, this.visHeight - this.margins.top])

    }

    drawAxis() {

    }
}