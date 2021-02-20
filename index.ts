const w : number = Math.floor(window.innerWidth / 10)  * 10 
const h : number = Math.floor(window.innerHeight / 10) * 10  
const gridSize =  10 
const backColor : string = "#BDBDBD"
const delay : number = 50 
const mid : number = Math.floor(w / (2 *gridSize))

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
const gridMap : Record<string, GridBlock> = {}

class GridBlock {

    down : GridBlock  
    right : GridBlock 
    filled : boolean = false 
    color : string 


    setColor(color : string) {
        this.color = color
    }


    constructor(private x : number, private y : number) {
        this.populateDown()
        gridMap[`${x}, ${y}`]  = this
    }

    populateDown() {
        if (this.x < w - gridSize) {
            this.right = new GridBlock(this.x + gridSize, this.y)
        }
        if (this.x < h - gridSize) {
            this.down = new GridBlock(this.x, this.y + gridSize)
        }
    }

    setFilled(filled : boolean) {
        this.filled = filled 
    }

    isDownFilled() {
        return (!this.down || (this.down && this.down.filled))
    }
    
    moveDown() {
        if (this.y < h - gridSize) {
            this.y += gridSize 
        }
    }

    moveLeft() {
        if (this.x >= gridSize) {
            this.x -= gridSize
        }
        if (this.x <= w - gridSize) {
            this.x += gridSize 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        if (this.filled && this.color) {
            context.fillStyle = this.color 
            context.fillRect(this.x, this.y, gridSize, gridSize)
            if (this.right) {
                this.right.draw(context)
            }
            if (this.down) {
                this.down.draw(context)
            }
        }
    }
}

class GridRenderer {

    root : GridBlock = new GridBlock(0, 0)

    render(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }
}
