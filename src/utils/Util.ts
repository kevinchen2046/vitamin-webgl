export class Loader {
    static loadImage(url: string) {
        return new Promise<HTMLImageElement>(reslove => {
            var image = new Image();
            if (!image) {
                console.log('Failed to create the image object');
                reslove(null);
                return;
            }
            image.onload = () => reslove(image);
            image.src = url;
        })
    }

    static loadJson(url: string) {
        return new Promise<any>(reslove => {
            var xhr = new XMLHttpRequest();
            xhr.onloadend = () => {
                xhr.onloadend=null;
                reslove(JSON.parse(xhr.responseText));
            }
            xhr.open("GET", url, false);
            xhr.send(null);
        });
    }
}