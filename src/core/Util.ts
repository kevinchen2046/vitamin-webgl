export class EnumUtil {
    static getKey(enmu,value){
        for(let k in enmu){
            if(enmu[k]==value) return k;
        }
        return '';
    }

    static getValue(enmu,key){
        for(let k in enmu){
            if(k==key) return enmu[k];
        }
        return '';
    }
}

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


export class Hashtable<T> {
    private _map: any;
    private _list: T[];

    constructor() {
        this._map = {};
        this._list = [];
    }

    set(key: string, value: T): T {
        this._map[key] = { value: value, index: this._list.length };
        this._list.push(value);
        return value;
    }

    has(key: string): boolean {
        return !!this._map[key];
    }

    get(key: string): T {
        return this._map[key] ? this._map[key].value : null;
    }

    remove(key: string) {
        if (this._map.hasOwnProperty(key)) {
            let info = this._map[key];
            let index = info.index;
            let res = info.value;
            this._map[key] = null;
            delete this._map[key];
            this._list.splice(index, 1);
            return res;
        }
        return null;
    }

    forEach(callbackfn: (value: T, index: number) => void, thisArg?: any) {
        let list = this._list;
        let length = list.length;
        if (!!thisArg) callbackfn = callbackfn.bind(thisArg);
        for (let i = 0; i < length; i++) {
            callbackfn(list[i], i);
        }
    }
    get list() { return this._list }

    get length() { return this._list.length }

    clone(): Hashtable<T> {
        let map = new Hashtable<T>();
        map._list = this._list.concat();
        map._map = Object.assign({}, map._map);
        return map;
    }
}

