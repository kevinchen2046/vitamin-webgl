
import { Context } from "../../core/Context";
import { Loader } from "../../utils/Util";
import { Sprite } from "./Sprite";


export class MatrixDemo {

  constructor() {
    this.initialize();
  }
  async initialize() {
    var canvas = document.getElementById('webgl');
    //创建渲染器
    Context.initialize(canvas as HTMLCanvasElement);
    //创建Shader
    let program=Context.createProgram();
    let names = [
      "flower.jpg",
      "girl.jpg",
      // "grass.png",
      // "logo.png",
      // "wood.jpg"
    ];
    let images = [];
    for (let i = 0; i < names.length; i++) {
      images[i] = await Loader.loadImage(`./res/${names[i]}`);
    }

    let sprites: Sprite[] = [];
    let total = 1;
    while (total--) {
      let sprite = new Sprite();
      sprites.push(sprite);
    }
    program.link();
    program.use();

    sprites.forEach(sprite=>{
      sprite.initialize();
      sprite.bitmap = images[(Math.random() * images.length) >> 0];
      sprite.pivot(sprite.width / 2, sprite.height / 2);
      sprite.pos((Context.clientWidth) / 2, (Context.clientHeight) / 2);
      sprite.scale(0.5);
      this.transColor(sprite);
    });

    Context.addTick(this, frame => {
      program.clear(0x554433);

      for (let i = 0; i < sprites.length; i++) {
        sprites[i].angle++;
        sprites[i].scale(0.5+Math.sin(frame/30)/10);
        sprites[i].updateRender();
      }
    });
  }

  private transColor(sprite: Sprite) {
    let dutation = 500 + (Math.random() * 1000) >> 0
    setInterval(() => {
      sprite.tintTo((Math.random() * 0xFFFFFF), dutation)
    }, dutation);
  }
}
