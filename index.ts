const w : number = Math.floor(window.innerWidth / 10)  * 10 
const h : number = Math.floor(window.innerHeight / 10) * 10  
const gridSize =  10 
const backColor : string = "#BDBDBD"
const delay : number = 50 


class Stage {

    context : CanvasRenderingContext2D
    canvas : HTMLCanvasElement = document.createElement('canvas')

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }
    
    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class Loop {

    animated : boolean = false
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

const loop : Loop = new Loop()

class GridBlock {

    down : GridBlock  
    right : GridBlock 
    filled : boolean = false 
    
    constructor(private x : number, private y : number) {
        this.populateDown() 
    }

    populateDown() {
        if (this.x < w - gridSize) {
            this.right = new GridBlock(this.x + gridSize, this.y)
        }
        if (this.x < h - gridSize) {
            this.right = new GridBlock(this.x, this.y + gridSize)
        }
    }

    setFilled(filled : boolean) {
        this.filled = filled 
    }

    isDownFilled() {
        return (!this.down || (this.down && this.down.filled))
    }
}
