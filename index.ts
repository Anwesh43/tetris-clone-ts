const w : number = 400
const h : number = 400
const gridSize =  40
const backColor : string = "#BDBDBD"
const delay : number = 200
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

    static init() : Stage {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.handleKey()
        return stage
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

class State {

    scale : number = 0 
    dir : number = 0 
    
    update(cb : Function) {
        this.scale += 0.25 * this.dir  
        if (this.scale > 1) {
            this.dir = 0
            this.scale = 0
            cb()

        }
    }

    startUpdating() {
        if (this.dir == 0) {
            this.dir = 1
        }
    }
}

class GridBlock {

    down : GridBlock
    right : GridBlock
    filled : boolean = false
    color : string
    moved : boolean = false 
    state : State = new State()

    setColor(color : string) {
        this.color = color
    }

    addRight() {
        this.right = new GridBlock(this.x + gridSize, this.y, false)
        return this.right
    }

    addDown() {
        this.down = new GridBlock(this.x, this.y + gridSize, false)
        return this.down
    }

    setColorRecurv(color) {

        if (this.right) {
            this.right.setColor(color)
            this.right.setColorRecurv(color)
        }
        if (this.down) {
            this.down.setColor(color)
            this.down.setColorRecurv(color)
        }
    }

    setFilledRecurv() {
        if (this.right) {
            this.right.filled = true 
            this.right.setFilledRecurv()
        }
        if (this.down) {
            this.down.filled = true 
            this.down.setFilledRecurv()
        }
    }
    
    drawStatic(context : CanvasRenderingContext2D) {
        const scale = this.state.scale 
        if (this.filled) {
            context.strokeStyle = 'white'
            context.strokeRect(
                this.x + gridSize * 0.5 * scale,
                this.y + gridSize * 0.5 * scale,
                gridSize * (1 - scale), 
                gridSize * (1 - scale)
            )
            context.fillStyle = this.color 
            context.fillRect(
                this.x + gridSize * 0.5 * scale,
                this.y + gridSize * 0.5 * scale,
                gridSize * (1 - scale), 
                gridSize * (1 - scale)
            )
            if (this.right) {
                this.right.drawStatic(context)
            }
            if (this.down) {
                this.down.drawStatic(context)
            }
            this.update()
        }
    }

    setFilledIfUpIsFilled() {
        let y = this.y 
        while (y >= gridSize) {
            const currGrid = gridMap[createKey(this.x, y)]
            const upGrid : GridBlock = gridMap[createKey(this.x, y - gridSize)]
            if (upGrid.filled) {
                currGrid.filled = upGrid.filled 
                currGrid.color = upGrid.color 
                upGrid.color = null  
                upGrid.filled = false 
            }
            y -= gridSize
        }
    }

    update() {
        this.state.update(() => {
            this.filled = false 
            this.color = null 
            this.setFilledIfUpIsFilled()
        })
    }

    start() {
        this.state.startUpdating()
    }


    constructor(private x : number, private y : number, inGrid: boolean) {
        if (inGrid) {
            this.populateDown()
            gridMap[createKey(this.x, this.y)]  = this
        }
    }

    populateDown() {
        //console.log(this.x, this. y)
        if (this.x < w - gridSize) {
            if (!gridMap[createKey(this.x + gridSize, this.y)]) {
                this.right = new GridBlock(this.x + gridSize, this.y, true)
            } else {
                this.right = gridMap[createKey(this.x + gridSize, this.y)]
            }
        }
        if (this.y < h - gridSize) {
            if (!gridMap[createKey(this.x, this.y + gridSize)]) {
                this.down = new GridBlock(this.x, this.y + gridSize, true)
            } else {
                this.down = gridMap[createKey(this.x, this.y + gridSize)]
            }
        }
    }

    setFilled(filled : boolean) {
        this.filled = filled
    }

    isDownFilled() {
        const downGrid : GridBlock = gridMap[createKey(this.x, this.y)]
        //console.log("DOWN_gRID", downGrid)
        const downFilled =  !downGrid.down || downGrid.down.filled
        if (downFilled) {
            //console.log("DOWN_FILLED", downGrid)
        }
        return downFilled
    }

    moveDown() {
        if (this.y < h - gridSize) {
            this.y += gridSize
            //console.log("Y", this.y)
        }
        if (this.right && this.y > this.right.y) {
            this.right.moveDown()
        }
        if (this.down && this.down.y - this.y < gridSize) {
            this.down.moveDown()
        }
    }

    moveLeft() {
        if (this.x >= gridSize) {
            this.x -= gridSize
        }
        if (this.right && this.right.x - this.x > gridSize) {
            this.right.moveLeft()
        }
        if (this.down && this.x < this.down.x) {
            this.down.moveLeft()
        }
    }

    moveRight() {
        if (this.x < w - gridSize) {
            this.x += gridSize
        }
        if (this.right && this.right.x === this.x) {
            this.right.moveRight()
        }
        if (this.down && this.down.x < this.x) {
            this.down.moveRight()
        }
    }

    draw(context : CanvasRenderingContext2D) {
        if (this.filled && this.color) {
            context.fillStyle = this.color
            context.fillRect(this.x, this.y, gridSize, gridSize)
            context.strokeStyle = 'white'
            context.strokeRect(this.x, this.y, gridSize, gridSize)   
            if (this.right) {
                this.right.draw(context)
            }
            if (this.down) {
                this.down.draw(context)
            }
        }
    }

    fillGrid(cb : Function) {
        const gridBlock : GridBlock = gridMap[createKey(this.x, this.y)]
        gridBlock.setFilled(true)
        gridBlock.setColor(this.color)
        cb(gridBlock)
        if (this.right) {
            this.right.fillGrid(() => {

            })
        }
        if (this.down) {
            this.down.fillGrid(() => {

            })
        }
    }
}

class MovingBlock {

    curr : GridBlock = new GridBlock(mid, 0, false)
    downMost : GridBlock = this.curr

    constructor() {
      this.defineBlock()
    }
    setColor(color : string) {
        this.curr.setColor(color)
        this.curr.setColorRecurv(color)
    }

    setFilledRecurv() {
        this.curr.setFilledRecurv()
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
        //console.log("CURR_DOWN", curr.isDownFilled())
        while (curr) {
            if (curr.isDownFilled()) {
                return false
            }
            curr = curr.right
        }
        return  true
    }

    addToGrid(cb : Function) {
        this.curr.fillGrid(cb)
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
        this.curr.setFilledRecurv()
    }
}

class NBlock extends MovingBlock {

    defineBlock() {
        super.defineBlock()
        const down = this.curr.addDown()
        const rightDown = down.addRight()
        const downRight = rightDown.addDown()
        this.downMost = downRight  
        this.curr.setFilledRecurv()
    }
}

class LineBlock extends MovingBlock {
    defineBlock() {
        super.defineBlock()
        this.curr.addRight().addRight().addRight()
        this.downMost = this.curr 
        this.curr.setFilledRecurv()
    }
}
class StaticGrid {

    blocks : Array<GridBlock> = []

    addGrid(grid : GridBlock) {
        this.blocks.push(grid)
    }

    draw(context : CanvasRenderingContext2D) {
        this.blocks.forEach((block) => {
            block.drawStatic(context)    
        })
    }

}

class MovingBlockController {

    curr : MovingBlock
    static i : number = 0
    static colors : Array<string> = ["cyan", "teal", "green"]
    create() {
        if (MovingBlockController.i % 3 == 0) {
            this.curr = new SquareBlock()
        }
        if (MovingBlockController.i % 3 == 1) {
            this.curr = new NBlock()
        }
        if (MovingBlockController.i % 3 == 2) {
            this.curr = new LineBlock()
        }
        this.curr.setColor(MovingBlockController.colors[MovingBlockController.i % 3])
        MovingBlockController.i++
    }

    moveDown(cb : Function) {
        //console.log("CURR", this.curr)
        if (this.curr.shouldMove()) {
            this.curr.moveDown()
        } else {
            this.curr.addToGrid(cb)
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
    staticGrid : StaticGrid = new StaticGrid()
    ruleEngine : RuleEngine = new RuleEngine()
    constructor() {
        this.controller.create()
    }

    render(context : CanvasRenderingContext2D) {
        //this.root.draw(context)
        this.controller.draw(context)
        this.staticGrid.draw(context)
        this.controller.moveDown((gb) => {
            this.staticGrid.addGrid(gb)
        })
        this.ruleEngine.checkRow()
    }

    handleMotion(e : number) {
        this.controller.handleMotion(e)
    }
}

class RuleEngine {

    checkRow() {
        let y : number = h - gridSize
        let root = gridMap[createKey(0, y)]
        while (root != null) {
            let curr = root
            let allFilled = true;
            while (curr != null) {
                allFilled = allFilled && curr.filled
                if (!allFilled) {
                    break
                }
                curr = curr.right 
            } 
            if (allFilled) {
                let curr = root; 
                console.log("ALL_FILLED", allFilled)
                while (curr != null) {
                    curr.start()
                    curr = curr.right 
                }
                break
            }
            y -= gridSize
            root = gridMap[createKey(0, y)] 
        }
    }
}

const stage : Stage = Stage.init()

loop.start(() => {
    stage.render()
})
