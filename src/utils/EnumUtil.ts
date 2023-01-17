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


