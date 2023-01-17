export class ColorUtil {

    /**
     * 从颜色值中提取三原色 
     * @param color
     * @return 
     */
    static extract(color: number): { r: number, g: number, b: number } {
        return {
            r: ((color & 0xff0000) >> 16),
            g: ((color & 0x00ff00) >> 8),
            b: ((color & 0x0000ff))
        }
    }
    /**
     * 将三原色合并 
     * @param r
     * @param g
     * @param b
     * @return 
     */
    static merge(r: number, g: number, b: number): number {
        return Math.max(0, Math.min(r, 0xFF)) << 16 | Math.max(0, Math.min(g, 0xFF)) << 8 | Math.max(0, Math.min(b, 0xFF));
    }

    static averageColor(color1, color2) {
        let { r: r1, g: g1, b: b1 } = this.extract(color1);
        let { r: r2, g: g2, b: b2 } = this.extract(color2);
        return this.merge(
            Math.floor(r1 + r2 / 2),
            Math.floor(g1 + g2 / 2),
            Math.floor(b1 + b2 / 2)
        );
    }
}
