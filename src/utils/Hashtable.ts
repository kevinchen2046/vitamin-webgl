
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

