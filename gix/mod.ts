import './src/mod'
import * as Gui from './src/gui'
export default Gui.Gui
export class gix extends Gui.Gui {
    static create(id: string){
        return new Gui.Gui(id)
    }
}
export class GuiBridge extends Gui.GuiServer {
}