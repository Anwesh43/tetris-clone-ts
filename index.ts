const w : number = window.innerWidth 
const h : number = window.innerHeight  
const backColor : string = "#BDBDBD"

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