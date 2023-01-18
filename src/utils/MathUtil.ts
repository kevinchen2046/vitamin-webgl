export class MathUtil {
    static radToDeg(r) {
        return r * 180 / Math.PI;
    }

    static degToRad(d) {
        return d * Math.PI / 180;
    }
    static isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
    static allPowerOf2(...args) {
        for(let i=0;i<args.length;i++){
            if(!this.isPowerOf2(args[i])){
                return false;
            }
        }
        return true;
    }
}