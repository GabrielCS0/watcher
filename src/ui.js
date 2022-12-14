const blessed = require('blessed')
const contrib = require('blessed-contrib')

const screen = blessed.screen()

const createEmptyList = (length, val) => Array.from({
    length
}, _ => val)

const getEmptyCoordinates = () => ({
    x: createEmptyList(10, ' '),
    y: createEmptyList(10, 1)
})

class Ui {
    line = contrib.line({
        label: 'Response Time (MS)',
        showLegend: true
    })

    getRequest = {
        ...getEmptyCoordinates(),
        title: 'GET /user',
        style: { line: 'yellow' }
    }

    postRequest = {
        ...getEmptyCoordinates(),
        title: 'POST /user',
        style: { line: 'green' }
    }

    constructor() {
        this.screen = screen
        this.screen.append(this.line)
        this.renderGraph() 
    }

    renderGraph() {
        this.line.setData([
            this.getRequest,
            this.postRequest
        ])

        this.screen.render() 
    }

    updateGraph(method, value) {
        const target = method === 'GET'
            ? this.getRequest
            : this.postRequest
        
        target.y.shift()
        target.y.push(value)

        this.renderGraph()
    }
}

module.exports = Ui
