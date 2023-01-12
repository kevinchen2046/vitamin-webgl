// Define several convolution kernels
export enum TypeKernel{
    /**无 */
    normal="normal",
    /**高斯模糊1*/
    gaussianBlur="gaussianBlur",
    /**高斯模糊2*/
    gaussianBlur2="gaussianBlur2",
    /**高斯模糊3*/
    gaussianBlur3="gaussianBlur3",
    /**反向锐化*/
    unsharpen="unsharpen",
    /**增加清晰度*/
    sharpness="sharpness",
    /**锐化*/
    sharpen="sharpen",
    /**边缘检测1*/
    edgeDetect="edgeDetect",
    /**边缘检测2*/
    edgeDetect2="edgeDetect2",
    /*边缘检测3*/
    edgeDetect3="edgeDetect3",
    /**边缘检测4*/
    edgeDetect4="edgeDetect4",
    /**边缘检测5*/
    edgeDetect5="edgeDetect5",
    /**边缘检测6*/
    edgeDetect6="edgeDetect6",
    /**高水平线*/
    sobelHorizontal="sobelHorizontal"
    /**高垂直线*/,
    sobelVertical="sobelVertical",
    /**横向交错*/
    previtHorizontal="previtHorizontal",
    /**竖向交错*/
    previtVertical="previtVertical",
    /**盒状模糊*/
    boxBlur="boxBlur",
    /**三角模糊*/
    triangleBlur="triangleBlur",
    /**浮雕*/
    emboss="emboss"
}
export let kernels = {
    normal: [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
    ],
    gaussianBlur: [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
    ],
    gaussianBlur2: [
        1, 2, 1,
        2, 4, 2,
        1, 2, 1
    ],
    gaussianBlur3: [
        0, 1, 0,
        1, 1, 1,
        0, 1, 0
    ],
    unsharpen: [
        -1, -1, -1,
        -1, 9, -1,
        -1, -1, -1
    ],
    sharpness: [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
    ],
    sharpen: [
        -1, -1, -1,
        -1, 16, -1,
        -1, -1, -1
    ],
    edgeDetect: [
        -0.125, -0.125, -0.125,
        -0.125, 1, -0.125,
        -0.125, -0.125, -0.125
    ],
    edgeDetect2: [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1
    ],
    edgeDetect3: [
        -5, 0, 0,
        0, 0, 0,
        0, 0, 5
    ],
    edgeDetect4: [
        -1, -1, -1,
        0, 0, 0,
        1, 1, 1
    ],
    edgeDetect5: [
        -1, -1, -1,
        2, 2, 2,
        -1, -1, -1
    ],
    edgeDetect6: [
        -5, -5, -5,
        -5, 39, -5,
        -5, -5, -5
    ],
    sobelHorizontal: [
        1, 2, 1,
        0, 0, 0,
        -1, -2, -1
    ],
    sobelVertical: [
        1, 0, -1,
        2, 0, -2,
        1, 0, -1
    ],
    previtHorizontal: [
        1, 1, 1,
        0, 0, 0,
        -1, -1, -1
    ],
    previtVertical: [
        1, 0, -1,
        1, 0, -1,
        1, 0, -1
    ],
    boxBlur: [
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111
    ],
    triangleBlur: [
        0.0625, 0.125, 0.0625,
        0.125, 0.25, 0.125,
        0.0625, 0.125, 0.0625
    ],
    emboss: [
        -2, -1, 0,
        -1, 1, 1,
        0, 1, 2
    ]
};