const w : number = Math.floor(window.innerWidth / 10)  * 10 
const h : number = Math.floor(window.innerHeight / 10) * 10  
const gridSize =  10 
const backColor : string = "#BDBDBD"
const delay : number = 50 
const mid : number = Math.floor(w / (2 * gridSize)) * gridSize 

const createKey : Function = (x : number, y : number) : string => `${x}, ${y}`
class Stage {

    context : CanvasRenderingContext2D
    canvas : HTMLCanvasElement = document.createElement('canvas')
    gridRenderer : GridRenderer = new GridRenderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
        this.gridRenderer.render(this.context)
    }

    handleKey() {
        window.onkeydown = (e: KeyboardEvent) => {
            this.gridRenderer.handleMotion(e.keyCode)
        }
    }
    
    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleKey()
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

    addRight() {
        this.right = new GridBlock(this.x + gridSize, this.y, false)
        return this.right 
    }

    addDown() {
        this.down = new GridBlock(this.x + gridSize, this.y, false)
        return this.down 
    }


    constructor(private x : number, private y : number, inGrid: boolean) {
        this.populateDown(inGrid)
        if (inGrid) {
            gridMap[createKey(this.x, this.y)]  = this
        }
    }

    populateDown(inGrid : boolean) {
        if (this.x < w - gridSize) {
            if (!gridMap[createKey(this.x + gridSize, this.y)]) {
                this.right = new GridBlock(this.x + gridSize, this.y, true)
            } else if (inGrid){
                this.right = gridMap[createKey(this.x + gridSize, this.y)]
            }
        }
        if (this.x < h - gridSize) {
            if (!gridMap[createKey(this.x, this.y + gridSize)]) {
                this.down = new GridBlock(this.x, this.y + gridSize, true)
            } else if (inGrid) {
                this.down = gridMap[createKey(this.x, this.y + gridSize)]
            }
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
        if (this.right) {
            this.right.moveDown()
        }
        if (this.down) {
            this.down.moveDown()
        }
    }

    moveLeft() {
        if (this.x >= gridSize) {
            this.x -= gridSize
        }
        if (this.right) {
            this.right.moveLeft()
        }
        if (this.down) {
            this.down.moveDown()
        }
    }

    moveRight() {
        if (this.x <= w - gridSize) {
            this.x += gridSize
        }
        if (this.right) {
            this.right.moveRight()
        }
        if (this.down) {
            this.down.moveRight()
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

    fillGrid() {
        gridMap[`${this.x}${this.y}`].setFilled(true)
        if (this.right) {
            this.right.fillGrid()
        }
        if (this.down) {
            this.down.fillGrid()
        }
    }
}

class MovingBlock {

    curr : GridBlock = new GridBlock(mid, 0, false)
    downMost : GridBlock = this.curr 

    setColor(color : string) {
        this.curr.setColor(color)
    }

    defineBlock() {
        this.curr.right = null 
        this.curr.down = null 
        this.curr.setFilled(true)
    }

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    moveDown() {
        this.curr.moveDown()
    }

    moveLeft() {
        this.curr.moveLeft()
    }
    
    moveRight() {
        this.curr.moveRight()
    }

    shouldMove() {
        var curr = this.downMost 
        while (curr) {
            if (curr.isDownFilled()) {
                return false 
            }
            curr = this.downMost.right  
        }
        return  true 
    }

    addToGrid() {
        this.curr.fillGrid()
    }
}

class SquareBlock extends MovingBlock {

    defineBlock() {
        super.defineBlock()
        const right = this.curr.addRight()
        const down = this.curr.addDown()
        const downRight = down.addRight()
        right.down = downRight
        this.downMost = down 
    }    
}

class MovingBlockController {

    curr : MovingBlock 
    static i : number = 0 
    static colors : Array<string> = ["cyan", "teal", "green"]
    create() {
        this.curr = new SquareBlock()
        this.curr.setColor(MovingBlockController.colors[MovingBlockController.i % 3])
        MovingBlockController.i++
    }

    moveDown() {
        if (this.curr.shouldMove()) {
            this.curr.moveDown() 
        } else {
            this.curr.addToGrid()
            this.create()
        }
    }

    moveRight() {
        this.curr.moveRight()
    }

    moveLeft() {
        this.curr.moveLeft()
    }

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    handleMotion(e : number) {
        if (e == 37) {
            this.moveLeft()
        } else if (e == 39) {
            this.moveRight()
        }
    }
}


class GridRenderer {

    root : GridBlock = new GridBlock(0, 0, true)
    controller : MovingBlockController = new MovingBlockController() 

    render(context : CanvasRenderingContext2D) {
        this.root.draw(context)
        this.controller.draw(context)
        this.controller.moveDown()
    }

    handleMotion(e : number) {
        this.controller.handleMotion(e)
    }
}

