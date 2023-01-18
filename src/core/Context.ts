import { Program } from "./Program";

export class Context {
    public static gl: WebGLRenderingContext;
    public static frame: number;
    public static programs: Program[];
    public static curProgram:Program;
    private static ticks: { caller: any, method: Function }[];
    public static initialize(canvas: HTMLCanvasElement) {
        Context.gl = Utils.getWebGLContext(canvas);
        if (!Context.gl) {
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
                let tick = __this.ticks[i];
                tick.method.call(tick.caller, __this.frame);
            }
            window.requestAnimationFrame(__loop);
        }
        __loop();
    }

    static get clientWidth() {
        return (Context.gl.canvas as HTMLCanvasElement).clientWidth;
    }

    static get clientHeight() {
        return (Context.gl.canvas as HTMLCanvasElement).clientHeight;
    }

    static createProgram() {
        let program = new Program();
        this.programs.push(program);
        return program;
    }

    static useProgram(index: number = 0) {
        this.curProgram=this.programs[index].use();
    }

    static updateRender() {
        for (let i = 0; i < this.programs.length; i++) {
            this.programs[i].updateRender();
        }
    }

    static addTick(caller: any, method: (frame: number) => void) {
        this.ticks.push({ caller: caller, method: method });
    }

    static removeTick(caller: any, method?: (frame: number) => void) {
        let i = this.getTickIndex(caller, method);
        if (i >= 0) this.ticks.splice(i, 1);
    }

    static getTickIndex(caller: any, method?: (frame: number) => void) {
        for (let i = 0; i < this.ticks.length; i++) {
            if (this.ticks[i].caller == caller && (!method || this.ticks[i].method == method)) {
                return i;
            }
        }
        return -1;
    }

    static get defaultProgram() {
        return this.programs[0];
    }

    static get defaultShader() {
        return this.programs[0].defaultShader;
    }
}