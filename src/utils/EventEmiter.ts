
export class EventEmiter {
    private _map: { [key: string]: { caller: any, method: Function, priority: number }[] };
    constructor() {
        this._map = {};
    }
    public on(type: string, caller: any, listener: Function, priority: number = 0) {
        if (!this._map[type]) this._map[type] = [];
        this._map[type].push({ caller: caller, method: listener, priority: priority })
    }
    public off(type: string, caller: any, listener: Function) {
        var list = this._map[type];
        if (list && list.length) {
            for (var i = 0; i < list.length; i++) {
                var object = list[i];
                if (object.caller == caller && object.method == listener) {
                    list.splice(i, 1);
                    i--;
                }
            }
        }
    }
    public emit(type: string, ...args) {
        var list = this._map[type];
        if (list && list.length) {
            list.sort((a, b) => {
                return a.priority > b.priority ? 1 : -1;
            });
            for (var i = 0; i < list.length; i++) {
                var object = list[i];
                object.method.apply(object.caller, args);
            }
        }
    }
}
