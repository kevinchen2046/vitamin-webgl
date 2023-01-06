import { RenderProgram } from "./RenderProgram";

export class RenderContext {
    public gl: WebGLRenderingContext;
    public frame: number;
    private programs: RenderProgram[];
    private ticks: Function[];
    private static _inst: RenderContext;
    public static create(canvas: HTMLCanvasElement) {
        if (!RenderContext._inst) {
            new RenderContext(canvas)
        }
    }
    public static get inst() {
        return RenderContext._inst;
    }
    constructor(canvas: HTMLCanvasElement) {
        this.gl = Utils.getWebGLContext(canvas);
        if (!this.gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }
        this.frame = 0;
        this.programs = [];
        this.ticks = [];
        let __this = this;
        function __loop() {
            __this.frame++;
            for (let i = 0; i < __this.ticks.length; i++) {
                __this.ticks[i](__this.frame);
            }
            window.requestAnimationFrame(__loop);
        }
        __loop();
        RenderContext._inst = this;
    }

    createProgram() {
        let program = new RenderProgram(this.gl);
        this.programs.push(program);
        return program;
    }

    updateRender() {
        for (let i = 0; i < this.programs.length; i++) {
            this.programs[i].updateRender();
        }
    }

    tick(func: (frame: number) => void) {
        this.ticks.push(func);
    }
}