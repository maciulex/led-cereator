var PROGRAM;

class Program {
    width  = 0;
    height = 0;

    cellSize = 0;

    coloursPalleteSize = [10, 2];
    colourPaleteSizeBox = 0;
    colours = [];
    frames  = [];

    config = new Config;

    selectedColorIndex = -1;
    activeFrame = 0;

    fastDragMode = false;

    drawFrame(frameIndex) {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                this.pixelChangeColor(x,y, this.frames[frameIndex].pixels[x][y]);
            }
        }
    }

    mouseDownEvent(event) {
        this.fastDragMode = true;
    }

    mouseUpEvent() {
        this.fastDragMode = false;
    }

    pixelChangeColor(x,y, color) {
        let red   = (color.red.toString(16).length != 1)   ? color.red.toString(16)   : ("0" + color.red.toString(16));
        let green = (color.green.toString(16).length != 1) ? color.green.toString(16) : ("0" + color.green.toString(16));
        let blue  = (color.blue.toString(16).length != 1)  ? color.blue.toString(16)  : ("0" + color.blue.toString(16));                                                            
        document.querySelector(`#cX${x}Y${y}`).style.backgroundColor = `#${red}${green}${blue}`;
    }

    pixelChangeColorOnActive(x,y) {
        this.frames[this.activeFrame].pixels[x][y].setColour(   this.colours[this.selectedColorIndex].red,
                                                                this.colours[this.selectedColorIndex].green,
                                                                this.colours[this.selectedColorIndex].blue
                                                            );
        this.pixelChangeColor(x,y, this.colours[this.selectedColorIndex]);
    }

    mainFrameCellHover(x, y) {
        if (!this.fastDragMode) return;
        if (this.selectedColorIndex == -1) return;
    
        this.pixelChangeColorOnActive(x,y);
    }

    mainFrameCellClicked(x, y) {
        if (this.selectedColorIndex == -1) return;
        this.pixelChangeColorOnActive(x,y);
    }

    colorPalleteClick(index) {
        document.querySelector(`#palleteIndex${index} div.palleteChoseBox`).setAttribute("style", "display: none");
        this.selectedColorIndex = index;
    }

    colorPalleteMouseOut(index) {
        document.querySelector(`#palleteIndex${index} div.palleteChoseBox`).removeAttribute("style", "display: none");
    }

    getColourPallete() {
        this.initBaseColour();

        if (this.config.colourPaleteDoc.clientWidth / this.coloursPalleteSize[0] > this.config.colourPaleteDoc.clientHeight / this.coloursPalleteSize[1]) this.colourPaleteSizeBox = this.config.colourPaleteDoc.clientHeight / this.coloursPalleteSize[1];
        else this.colourPaleteSizeBox = this.config.colourPaleteDoc.clientWidth / this.coloursPalleteSize[0];
        this.colourPaleteSizeBox -= 8;
        this.colourPaleteSizeBox = Math.floor(this.colourPaleteSizeBox);

        let tableContent = "";
        var index = 0;
        for (var y = 0; y < this.coloursPalleteSize[1]; y++) {
            tableContent += `<tr>`;
            for (var x = 0; x < this.coloursPalleteSize[0]; x++) {
                //tableContent += `<td id="palleteIndex${index}" class="mainFrameCell" style='width:${this.colourPaleteSizeBox}px; height:${this.colourPaleteSizeBox}px; background-color: rgb(${this.colours[index].red},${this.colours[index].green},${this.colours[index].blue});'>
                //
                //</td>`;
                let red   = (this.colours[index].red.toString(16).length != 1)   ? this.colours[index].red.toString(16)   : ("0" + this.colours[index].red.toString(16));
                let green = (this.colours[index].green.toString(16).length != 1) ? this.colours[index].green.toString(16) : ("0" + this.colours[index].green.toString(16));
                let blue  = (this.colours[index].blue.toString(16).length != 1)  ? this.colours[index].blue.toString(16)  : ("0" + this.colours[index].blue.toString(16));

                tableContent += `<td id="palleteIndex${index}" class="mainFrameCell" style='width:${this.colourPaleteSizeBox}px; height:${this.colourPaleteSizeBox}px;'>
                    <div>
                        <div class="palleteChoseBox" onclick="PROGRAM.colorPalleteClick(${index});"></div>
                        <input onmouseout="PROGRAM.colorPalleteMouseOut(${index});" class="palleteChoseInput" type="color" value="#${red}${green}${blue}" onchange="changePalleteColour(${index}, this)">
                </td>`;
                index += 1;
            }
            tableContent += `</tr>`;
        }

        this.config.colourPaleteDoc.innerHTML = `
                <table>
                    <tbody> 
                        ${tableContent}
                    </tbody>
                </table>`;
    }

    evaluateExpressionValue(expression,x) {
        let numbers = [];
        let symbols = [];


        let numberTmp = "";
        for (let i = 0; i < expression.length; i++) {
            switch (expression[i]) {
                case "^":
                case "*":
                case "/":
                case "+":
                case "-":
                    symbols.push(expression[i]);
                    if (numberTmp != "") numbers.push(parseInt(numberTmp));
                    numberTmp = "";
                break;
                case "x":
                    numbers.push(x);
                    numberTmp = "";
                break;
                default:
                    numberTmp += expression[i];
                break;
            }

        }
        if (numberTmp != "") numbers.push(parseInt(numberTmp));

        let sybmbolHierarchySize = 3;
        var lastResult;
        for (let syb = 0; syb < sybmbolHierarchySize; syb++) {
            for (let i = 0; i < symbols.length; i++) {
                var result = null;
                let number1 = (numbers[i]   != "x") ? numbers[i]   : x;
                let number2 = (numbers[i+1] != "x") ? numbers[i+1] : x;
                switch (syb) {
                    case 0:
                        if      (symbols[i] == "^") result = Math.pow(number1, number2);
                    break;
                    case 1:
                        if      (symbols[i] == "*") result = number1 * number2; 
                        else if (symbols[i] == "/") result = number1 / number2;
                    break;
                    case 2:
                        if      (symbols[i] == "+") result = number1 + number2; 
                        else if (symbols[i] == "-") result = number1 - number2;
                    break;
                }
                if (result === null || result === undefined) continue;
                numbers[i]   = result;
                numbers[i+1] = result;
                lastResult = result;
                console.log(result);
            }
        }
        return lastResult;
    }

    deleteFrame(frame) {
        if (this.frames.length == 1) return;
        this.frames.splice(frame, 1);
        if (this.activeFrame <= this.frames.length) this.activeFrame = this.frames.length-1;
        this.drawFrame(this.activeFrame);
        this.updateFrameCount();
    }

    doMathExpression(mathSymbole, expression) {
        if (this.selectedColorIndex == -1) return;
        console.log(mathSymbole, expression);

        for (let x = 0; x < this.width; x++) {
            let y = this.evaluateExpressionValue(expression, x);
            switch (mathSymbole) {
                //<
                case "4":
                    this.pixelChangeColorOnActive(x,y-1);
                case "2":
                    console.log(y);
                    for (let i = y; i < this.height; i++) {
                        console.log(x,i);
                        this.pixelChangeColorOnActive(x,i);
                    }
                break;
                //>
                case "3":
                    this.pixelChangeColorOnActive(x,y-1);
                case "1":
                    for (let i = 0; i < this.height; i++) {
                        if (!(i < y-1)) continue;
                        this.pixelChangeColorOnActive(x,i);
                    }
                break;
                case "0":
                    this.pixelChangeColorOnActive(x,y-1);
                break;
            }
        }

    }

    initBaseColour() {
        this.colours.push(new Pixel(255,255,255));
        this.colours.push(new Pixel(0,0,0));
        this.colours.push(new Pixel(255,0,0));
        this.colours.push(new Pixel(0,255,0));
        this.colours.push(new Pixel(0,0,255));
        this.colours.push(new Pixel(255,255,0));
        this.colours.push(new Pixel(0,255,255));
        this.colours.push(new Pixel(255,0,255));
        this.colours.push(new Pixel(237,112,20));
        this.colours.push(new Pixel(255,192,203));
        for (let i = this.colours.length; i < this.coloursPalleteSize[0]*this.coloursPalleteSize[1]; i++) this.colours.push(new Pixel(255,255,255));

        console.log(this.colours);
    }

    getFrameCells() {
        if (this.config.focusFrameDoc.clientWidth / this.width > this.config.focusFrameDoc.clientHeight / this.height) this.cellSize = this.config.focusFrameDoc.clientHeight / this.height;
        else this.cellSize = this.config.focusFrameDoc.clientWidth / this.width;
        
        this.cellSize -= 10; //margin;
        this.cellSize = Math.floor(this.cellSize);
        console.log(this.cellSize);
        let tableContent = "";
        for (var y = 0; y < this.height; y++) {
            tableContent += `<tr>`;
            for (var x = 0; x < this.width; x++)
                tableContent += `<td id="cX${x}Y${y}" class="mainFrameCell" style='width:${this.cellSize}px; height:${this.cellSize}px' onmousedown="PROGRAM.mainFrameCellClicked(${x}, ${y});" onmouseover="PROGRAM.mainFrameCellHover(${x}, ${y});"></td>`;
            
            tableContent += `</tr>`;
        }

        this.config.focusFrameDoc.innerHTML = `
            <table>
                <tbody> 
                    ${tableContent}
                </tbody>
            </table>
        `;
    }

    updateFrameCount() {
        this.config.frameActive.textContent = this.activeFrame+1;
        this.config.allFrames.textContent = this.frames.length;
    }

    createNewFrame() {
        this.frames.push(new Frame(this.width, this.height));
        this.activeFrame = this.frames.length-1;
        this.drawFrame(this.activeFrame);

        this.updateFrameCount();
    }

    moveToNextFrame() {
        if (this.activeFrame == this.frames.length-1) this.activeFrame = 0;
        else this.activeFrame += 1;

        this.drawFrame(this.activeFrame);
        this.updateFrameCount();
    }
    
    moveToPreviousFrame() {
        if (this.activeFrame == 0) this.activeFrame = this.frames.length-1;
        else this.activeFrame -= 1;

        this.drawFrame(this.activeFrame);
        this.updateFrameCount();
    }

    pastePreviusFrame() {
        var frame = new Frame(this.width, this.height);
        if (this.activeFrame == 0) frame.copyPixels(this.frames[this.frames.length-1].pixels);
        else frame.copyPixels(this.frames[this.activeFrame-1].pixels);
        this.frames[this.activeFrame] = frame;
        this.drawFrame(this.activeFrame);
    }
    
    shiftX(shift) {
        this.frames[this.activeFrame].shiftX(shift);
        this.drawFrame(this.activeFrame);
    }

    
    shiftY(shift) {
        this.frames[this.activeFrame].shiftY(shift);
        this.drawFrame(this.activeFrame);
    }
    
    eksportOpen(open = true) {
        var mainWindow = document.querySelector(".eksport");
        if (!open) {
            mainWindow.style.display = "none";
            return;
        }
        mainWindow.style.display = "grid";
    }

    eksportToClipboard() {

    }

    scaleToRange(rangeMin, rangeMax, number) {
        let a = 0;
        let b = 255;
        let c = rangeMin;
        let d = rangeMax;    
        let result = (b*c-a*d)/(b-a)+number*(d-c)/(b-a);
        console.log(rangeMin, rangeMax, number, result);
        return Math.floor(result);
    }

    eksport() {
        var eksportType    = parseInt(document.querySelector("#eksportType").value);
        var programExample = document.querySelector("#typicalProgram");
        var maxBrightness  = parseInt(document.querySelector("#maksBright").value);
        var destynation    = document.querySelector('#eksportDST');
        var result = "";
        switch (eksportType) {
            case 1:
                var framesAmount = this.frames.length;
                var frameSize = this.width*this.height;
                result += `#define FRAMESNUMBER ${framesAmount}<br>#define FRAMESIZE ${frameSize}<br>`;
                result += `uint8_t frames[${framesAmount}][${frameSize}][3] = {`;
                for (let frame = 0; frame < framesAmount; frame++) {
                    let orderedArrayOfPixels = [];
                    if (frame != 0) result += `,{`;
                    else result += `{`;
                    for (let x = 0; x < this.width; x++) {
                        for (let y = 0; y < this.height; y++) {
                            let red   = this.scaleToRange(0, maxBrightness, this.frames[frame]['pixels'][x][y].red);
                            let green = this.scaleToRange(0, maxBrightness, this.frames[frame]['pixels'][x][y].green);
                            let blue  = this.scaleToRange(0, maxBrightness, this.frames[frame]['pixels'][x][y].blue);
                            orderedArrayOfPixels[this.frames[frame]['pixels'][x][y].index] = 
                                ` {${red},${green},${blue}} `;
                                //orderedArrayOfPixels[this.frames[frame]['pixels'][x][y].index] = `${x}, ${y}`;
                        }
                    }
                    console.log(orderedArrayOfPixels);
                    for (let i = 0; i < orderedArrayOfPixels.length; i++) {
                        if (i != 0) result += ",";
                        result += orderedArrayOfPixels[i];
                    }
                    result += `}`;
                }
            break;
            case 2:

            break;
        }
        result += '};';
        destynation.innerHTML = result;
        programExample.innerHTML = result

    }
    reIndexPixels(how) {
        how = parseInt(how);
        console.log(how)
        var framesAmount = this.frames.length;
        switch (how) {
            case 1:
                for (let x = 0; x < this.width; x++) {
                    for (let y = 0; y < this.height; y++) {
                        var counter = 0;
                        for (let frame = 0; frame < framesAmount; frame++) {
                            for (let y = 0; y < this.height; y++) {
                                if (y%2 == 0) {
                                    for (let x = 0; x < this.width; x++) {
                                        this.frames[frame].pixels[x][y].index = counter;
                                        counter += 1; 
                                    }
                                } else {
                                    for (let x = this.width-1; x >= 0; x--) {
                                        this.frames[frame].pixels[x][y].index = counter;
                                        counter += 1; 
                                    }
                                }
                            }
                        }
                    }
                }
            break;
            case 2:
                var counter = 0;
                for (let frame = 0; frame < framesAmount; frame++) {
                    for (let x = 0; x < this.width; x++) {
                        for (let y = 0; y < this.height; y++) {
                            this.frames[frame][pixels][x][y].index = counter;
                            counter += 1; 
                        }
                    }
                }
            break;
        }
    }
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.frames.push(new Frame(width,height));

        console.log(this.frames);
        this.config.focusFrameDoc.innerHTML = "";
        this.config.colourPaleteDoc.innerHTML = "";

        this.getColourPallete();
        this.getFrameCells();
        this.drawFrame(0);
        this.updateFrameCount();
        this.reIndexPixels(document.querySelector("#eksportLedWireStyle").value);
    }
}

class Frame {
    pixels = [];

    swapPixel(x1, y1, x2, y2) {
        let colour1 = [this.pixels[x1][y1].red, this.pixels[x1][y1].green, this.pixels[x1][y1].blue];
        let colour2 = [this.pixels[x2][y2].red, this.pixels[x2][y2].green, this.pixels[x2][y2].blue];
        this.pixels[x2][y2].setColour(colour1[0], colour1[1], colour1[2]);
        this.pixels[x1][y1].setColour(colour2[0], colour2[1], colour2[2]);
    }


    shiftX(shift) {
        if (shift == 0) return;

        let positive = (shift * -1 > 0) ? true : false;
        shift = Math.abs(shift);


        if (positive) {
            for (let i = 0; i < shift; i++) {
                for (let x = 0; x < this.pixels.length-1; x++) {
                    for (let y = 0; y < this.pixels[x].length; y++) {
                        this.swapPixel(x, y, x+1, y);
                    }
                }
            }
        } else {
            for (let i = 0; i < shift; i++) {
                for (let x = this.pixels.length-1; x > 0; x--) {
                    for (let y = this.pixels[x].length-1; y >= 0; y--) {
                        this.swapPixel(x, y, x-1, y);
                    }
                }
            }
        }
    }

    shiftY(shift) {
        if (shift == 0) return;

        let positive = (shift * -1 > 0) ? false : true;
        shift = Math.abs(shift);

        if (positive) {
            for (let i = 0; i < shift; i++) {
                for (let x = 0; x < this.pixels.length; x++) {
                    for (let y = 0; y < this.pixels[x].length-1; y++) {
                        this.swapPixel(x, y, x, y+1);
                    }
                }
            }
        } else {
            for (let i = 0; i < shift; i++) {
                for (let x = this.pixels.length-1; x >= 0; x--) {
                    for (let y = this.pixels[x].length-1; y > 0; y--) {
                        this.swapPixel(x, y, x, y-1);
                    }
                }
            }
        }
    }
    
    copyPixels(pixels) {
        for (let x = 0; x < pixels.length; x++){
            for (let y = 0; y < pixels[x].length; y++) this.pixels[x][y].setColour(pixels[x][y].red,pixels[x][y].green,pixels[x][y].blue);
        }
    }

    constructor(width, height) {
        let counter = 0;
        for (let x = 0; x < width; x++) {
            this.pixels.push([]);
            for (let y = 0; y < height; y++) {
                this.pixels[x].push(new Pixel(255,255,255, counter));
                counter += 1;
            }
        }
    }
}

class Pixel {
    index = 0;
    red   = 0;
    green = 0;
    blue  = 0;

    setColour(red,green,blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    constructor(red, green, blue, index = 0) {
        this.red   = red;
        this.green = green;
        this.blue  = blue;
        this.index = index;
    }
}

class Config {
    focusFrameDoc = document.querySelector("main");
    colourPaleteDoc = document.querySelector(".color-box");
    frameActive = document.querySelector("#frameActive");
    allFrames = document.querySelector("#allFrames");
}






function changePalleteColour(index, colour) {
    colour = colour.value;
    
    let red   = parseInt(colour[1]+colour[2], 16);
    let green = parseInt(colour[3]+colour[4], 16);
    let blue  = parseInt(colour[5]+colour[6], 16);

    PROGRAM.colours[index].setColour(red, green, blue);
}


function init(form) {
    let width = form.width.value;
    let height = form.hight.value; 

    PROGRAM = new Program(width, height);
    document.addEventListener("mousedown", () => {PROGRAM.mouseDownEvent(this.event)});
    window.addEventListener("mouseup",     () => {PROGRAM.mouseUpEvent()  });
}

init(document.querySelector("form"));

