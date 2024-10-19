(function() {
    var canvas = document.querySelector('#paint');
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    let slider = document.querySelector('.slider');
    var sketch = document.querySelector('#sketch');
    var sketch_style = getComputedStyle(sketch);
    canvas.width = parseInt(sketch_style.getPropertyValue('width'));
    canvas.height = parseInt(sketch_style.getPropertyValue('height'));

    const img = new Image();
    img.src = './Img/William_Albert_Allard_01.jpg';

    // канвас для блюра
    const blurCanvas = document.createElement('canvas');
    const blurCtx = blurCanvas.getContext('2d');
    blurCanvas.width = canvas.width;
    blurCanvas.height = canvas.height;

    img.onload = function() {
        // блюр изобр
        blurCtx.filter = 'blur(5px)';
        blurCtx.drawImage(img, 0, 0, blurCanvas.width, blurCanvas.height);
        
        // блюр на канвасе
        ctx.drawImage(blurCanvas, 0, 0);
        
        // изобр без блюра на канвасе
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    
    var colors = document.querySelectorAll('.color');
    const brush = document.querySelector('.Brush-button');
    const blur = document.querySelector('.Blur-button');
    const backButton = document.querySelector('.back-button');
    const forwardButton = document.querySelector('.forward-button');
    const saveButton = document.querySelector('.save-button');
    const colorButtons = document.querySelector('.color-buttons');

    let isDrawing = false;
    let isBlurring = false;
    let drawHistory = []; // рисование
    let redoHistory = []; //  повтор

    function saveState() {
        drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); //  текущее состояние
        redoHistory = []; // очистка повторов
    }

    brush.addEventListener('click', () => {
        isBlurring = false;
        isDrawing = true;
        brush.style.border = '1px solid green';
        blur.style.border = "";
        colorButtons.style.display = 'flex';
        canvas.style.cursor = 'crosshair';
    });

    blur.addEventListener('click', () => {
        isBlurring = true;
        isDrawing = false;
        brush.style.border = "";
        blur.style.border = '1px solid green';
        colorButtons.style.display = 'none';
        canvas.style.cursor = 'crosshair';
    });

    var mouse = { x: 0, y: 0 };
    var last_mouse = { x: 0, y: 0 };

    canvas.addEventListener('mousemove', function(e) {
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;

        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
    }, false);

    ctx.lineWidth = slider.value;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';

    slider.addEventListener('change', () => {
        ctx.lineWidth = slider.value;
    });

    colors.forEach((color) => {
        color.addEventListener('click', () => {
            ctx.strokeStyle = color.id;
            colors.forEach(c => c.classList.remove('active'));
            color.classList.add('active');
        });
    });

    canvas.addEventListener('mousedown', function() {
        if (isDrawing || isBlurring) {
            canvas.addEventListener('mousemove', isBlurring ? onBlur : onPaint, false);
        }
    }, false);

    canvas.addEventListener('mouseup', function() {
        if (isDrawing || isBlurring) {
            saveState(); // состояние рисования
            canvas.removeEventListener('mousemove', onBlur, false);
            canvas.removeEventListener('mousemove', onPaint, false);
        }
    }, false);

    var onBlur = function() {
        ctx.globalCompositeOperation = 'destination-out'; // Стирание слоя орига
        ctx.beginPath();
        ctx.moveTo(last_mouse.x, last_mouse.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over'; // норм рисование
    };
    

    var onPaint = function() {
        ctx.beginPath();
        ctx.moveTo(last_mouse.x, last_mouse.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.closePath();
        ctx.stroke();
    };

    backButton.addEventListener('click', () => {
        if (drawHistory.length > 0) {
            redoHistory.push(drawHistory.pop()); //текущее состояние в потворы
            if (drawHistory.length > 0) {
                ctx.putImageData(drawHistory[drawHistory.length - 1], 0, 0); // предыдущее состояние
            } else {
                //  исходное изображение если истории нет
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
        }
    });

    forwardButton.addEventListener('click', () => {
        if (redoHistory.length > 0) {
            drawHistory.push(redoHistory.pop()); //состояние из повторов
            ctx.putImageData(drawHistory[drawHistory.length - 1], 0, 0);
        }
    });

    saveButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'my_drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click(); 
    });

}());
