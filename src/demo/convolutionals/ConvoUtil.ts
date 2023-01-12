export class ConvoUtil {
    /**
     * 获取卷积核权重
     * @param kernel 
     * @returns 
     */
    static computeKernelWeight(kernel: number[]) {
        var weight = kernel.reduce(function (prev, curr) {
            return prev + curr;
        });
        return weight <= 0 ? 1 : weight;
    }
    /**
     * 创建一个矩形顶点数据
     * @param x 
     * @param y 
     * @param width 
     * @param height 
     * @returns 
     */
    static createRectangleData(x, y, width, height) {
        var x1 = x;
        var x2 = x + width;
        var y1 = y;
        var y2 = y + height;
        return [
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ];
    }
}