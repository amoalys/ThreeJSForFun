function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    }
}

var winsize = {
    width: window.innerWidth,
    height: window.innerHeight
};

var Bubbles = function(opt) {
    this.canvas = document.getElementById(opt.canvasID);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = winsize.width;
    this.canvas.height = winsize.height;
    this.sourcex = opt.sourcex ? opt.sourcex : this.sourcex;
    this.sourcey = opt.sourcey ? opt.sourcey : this.sourcey;
    this.cntr = 0;
    this.circleArr = [];
    this.requestTd = undefined;

    var self = this;
    this.debounceResize = debounce(function() {
        winsize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        self.canvas.height = winsize.height;
        self.canvas.width = winsize.width;
    }, 10);

    window.addEventListener('resize', this.debounceResize);
}
Bubbles.prototype = {
    loop: function() {
        //- this.requestTd = requestAnimationFrame(Bubbles.loop.bind(this));
        this.requestTd = requestAnimationFrame(this.loop.bind(this));

        this.update();
        this.render();
    },
    update: function() {
        if (this.cntr++ % 5 === 0) {
            this.createCircle();
        }
        for (var circle in this.circleArr) {
            circle = this.circleArr[circle];
            circle.x = circle.startx + Math.cos(-circle.y / 80) * circle.swing;
            circle.y -= circle.sy;
            circle.s *= 1.0001;
        }

        while (this.circleArr.length > 2 &&
            (this.circleArr[0].x + this.circleArr[0].s > winsize.width ||
            this.circleArr[0].x + this.circleArr[0].s < 0 ||
            this.circleArr[0].y + this.circleArr[0].s > winsize.height ||
            this.circleArr[0].y + this.circleArr[0].s < 0)) {
            this.circleArr.shift();
            }
    },
    render: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var circle in this.circleArr) {
            var current = this.circleArr[circle];
            this.drawCircle(current.x, current.y, current.s);
        }
    },
    createCircle: function() {
        this.circleArr[this.circleArr.length] = {
            x: this.sourcex,
            y: this.sourcey,
            sx: Math.random() * 4 - 2,
            sy: Math.random() * 2 + 1,
            startx: this.sourcex,
            swing: Math.random() * 80 - 40,
            s: Math.random() * winsize.height / 100
        };
    },
    drawCircle: function(x, y, radius) {
        this.ctx.fillStyle = 'rgba(234, 234, 239, .5)'; // rgb(234, 234, 239)
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        this.ctx.fill();
    },
    start: function() {
        if (!this.requestTd) {
            //- document.onmousemove = this.getMouseCoordinates.bind(this);
            this.loop();    
        }
    },
    stop: function() {
        if (this.requestTd) {
            window.cancelAnimationFrame(this.requestTd);
            this.requestId = undefined;
            document.onmousemove = null;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },
    getMouseCoordinates: function(ev) {
        var ev = ev || window.event;
        this.mousex = ev.pageX;
        this.mousey = ev.pageY;
    }
}

module.exports = Bubbles