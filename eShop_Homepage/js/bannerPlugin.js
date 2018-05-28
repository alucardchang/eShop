~function (window) {

    class Slider {
        constructor(container, settings = {}) {
            let {
                url = null,  //URL address of Ajax data
                defaultIndex = 0,  //Deafult index of slide to display
                speed = 500,  //Slide play speed
                imgPreload = true,
                loadTime = 700,  //Image preload time
                autoPlay = true,  //Turn on/off slide auto play
                playInterval = 2000,  //Interval of slide play
                showFocus = true,  //Show or hide focus box
                focusActive = true,  //Enable/Disable focus button
                focusEvent = 'click',  //How to active event binding on focus
                showArrow = true,  //Show or hide arrow box
                width = 1000, //Default width of wrapper
                playTimer = null,
                wrapperClass = '.wrapper',
                focusClass = '.focus',
                playEffect = 'Linear'
            } = settings;
            ["url", "defaultIndex", "speed", "imgPreload", "loadTime", "autoPlay", "playInterval", "showFocus", "focusActive", "focusEvent", "showArrow", "width", "playTimer", "wrapperClass", "focusClass", "playEffect"].forEach(item => {
                this[item] = eval(item);
            })
            this.container = container;
            this.wrapper = this.container.querySelector(wrapperClass);
            this.wrapperList = null;
            this.focus = this.container.querySelector(focusClass);
            this.focusList = null;
            // this.wrapperList=[...this.wrapper.children].filter(item=>this.hasClass(item,"slide"));
            // this.focusList=this.focus.querySelectorAll('li');
            if (this.showArrow) {
                this.arrowLeft = this.container.querySelector('.arrowLeft');
                this.arrowRight = this.container.querySelector('.arrowRight');
            }
            this.init();
        }

        init() {
            let promise = this.queryData();
            promise.then(() => {
                clearTimeout(this.preLoadTimer);

                this.bindHTML();
                this.defaultSlideShow();
                //Set timer for slider if autoPlay is enable
                if (this.autoPlay) {
                    this.playTimer = setInterval(() => {
                        this.setPlay()
                    }, this.playInterval);
                }
                // this.clickFocus();
                this.pauseSlide();
            });
        }

        hasClass(ele, className) {
            return ele.className.trim().split(/ +/).indexOf(className) >= 0;
        }


        //Get data from server
        queryData() {
            let url = this.url;
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        this.data = JSON.parse(xhr.responseText);
                        resolve();
                    }
                };
                xhr.send(null);
            })
        }

        //Bind data to HTML
        bindHTML() {
            let slideStr = ``,
                focusStr = ``;
            this.data.forEach((item, index) => {
                let {img, desc} = item;
                slideStr += `<div class="slide"><img src="" data-src="${img}" alt="${desc}"></div>`;
                focusStr += `<li class="${index === 0 ? 'active' : ''}"></li>`
            });
            this.wrapper.innerHTML = slideStr;
            //Append LI element focus box if showFocus is enable
            this.showFocus ? this.focus.innerHTML = focusStr : utils.css(this.focus, "display", "none");
            this.wrapperList = [...this.wrapper.children].filter(item => this.hasClass(item, "slide"));
            this.focusList = this.focus.querySelectorAll('li');

            //克隆第一个slide元素实现无缝衔接
            this.wrapper.appendChild(this.wrapperList[0].cloneNode(true));
            this.wrapperList = [...this.wrapper.children].filter(item => this.hasClass(item, "slide"));


            //设置wrapper总宽度
            utils.css(this.wrapper, "width", this.wrapperList.length * this.width);
        }

        //Image Preload
        preloadImg() {
            let curSlideBox = this.wrapperList[this.defaultIndex],
                curImg = curSlideBox.querySelector("img"),
                curSrc = curImg.getAttribute("data-src");
                if (this.imgPreload) {
                this.preLoadTimer = setTimeout(() => {
                     let   fakeImg = new Image();
                    fakeImg.onload = () => {
                        curImg.src = curSrc;
                        utils.css(curImg, "display", "block");
                        fakeImg = null;
                    };
                    fakeImg.src = curSrc;
                }, this.loadTime)
            }else{
                curImg.src = curSrc;
                utils.css(curImg, "display", "block");
            }

        }

        //Set default slide to show
        defaultSlideShow() {
            this.preloadImg()
            utils.css(this.wrapper, "left", -this.defaultIndex * this.width);
        }

        //Set play step for slide
        setPlay() {
            this.defaultIndex++;
            if (this.defaultIndex >= this.wrapperList.length) {
                utils.css(this.wrapper, 'left', 0);
                this.defaultIndex = 1;
            }
            this.playSlide();
        };

        //Play Slide
        playSlide() {
            animate(this.wrapper, {left: -this.defaultIndex * this.width}, this.speed, this.playEffect);
            this.preloadImg();
            this.autoFocus();
        }

        //Focus switch with slide
        autoFocus() {
            if (!this.showFocus) return;
            let liIndex = this.defaultIndex;
            [].forEach.call(this.focusList, (item, index) => {
                liIndex === this.wrapperList.length - 1 ? liIndex = 0 : void 0;
                item.className = index === liIndex ? 'active' : '';
            })
        };

        //Focus control slide switch
        focusControl() {
            if (!this.showFocus || !this.focusActive) return;
            [].forEach.call(this.focusList, (item, index) => {
                item[`on${this.focusEvent}`] = () => {
                    //Prevent repeated slide switch
                    if (this.defaultIndex === index) return;
                    //Fix animation from clone slide to previous slides
                    if (this.defaultIndex === this.wrapperList.length - 1) {
                        utils.css(this.wrapper, "left", -this.width * 0);
                    }
                    this.defaultIndex = index;
                    this.playSlide();
                }
            })
        };

        //Pause slider
        pauseSlide() {
            this.container.onmouseenter = () => {
                clearInterval(this.playTimer);
                if (!this.showArrow) return;
                this.arrowLeft.style['display'] = 'block';
                this.arrowRight.style['display'] = 'block';
            };

            this.container.onmouseleave = (eventObj) => {
                if (this.autoPlay) {
                    this.playTimer = setInterval(() => {
                        this.setPlay()
                    }, this.playInterval);
                }
                if (!this.showArrow) return;
                this.arrowLeft.style['display'] = '';
                this.arrowRight.style['display'] = '';
            };

            //Custom Focus Controller
            this.container[`on${this.focusEvent}`] = (eventObj) => {
                if (!this.showFocus) return;
                [].forEach.call(this.focusList, (item, index) => {
                    this.focusControl();
                })
            }
            //Click Controller
            this.container.onclick = (eventObj) => {
                [].forEach.call(this.focusList, (item, index) => {
                    if (eventObj.target === item) {
                        this.focusControl();
                    }
                });
                if (eventObj.target === this.arrowLeft) {
                    this.defaultIndex--;
                    if (this.defaultIndex < 0) {
                        utils.css(this.wrapper, "left", -(this.wrapperList.length - 1) * this.width);
                        this.defaultIndex = this.wrapperList.length - 2;
                    }
                    this.playSlide();
                }
                if (eventObj.target === this.arrowRight) {
                    this.setPlay();
                }
            }
        };


    }

    window.Slider = Slider;


    //=>UTILS操作CSS工具库
    let utils = (function () {
        //=>获取样式
        let getCss = (ele, attr) => {
            let val = null,
                reg = /^-?\d+(\.\d+)?(px|rem|em)?$/;
            if ('getComputedStyle' in window) {
                val = window.getComputedStyle(ele)[attr];
                if (reg.test(val)) {
                    val = parseFloat(val);
                }
            }
            return val;
        };

        //=>设置样式
        let setCss = (ele, attr, value) => {
            if (!isNaN(value)) {
                if (!/^(opacity|zIndex)$/.test(attr)) {
                    value += 'px';
                }
            }
            ele['style'][attr] = value;
        };

        //=>批量设置样式
        let setGroupCss = (ele, options) => {
            for (let attr in options) {
                if (options.hasOwnProperty(attr)) {
                    setCss(ele, attr, options[attr]);
                }
            }
        };

        //=>合并为一个
        let css = (...arg) => {
            let len = arg.length,
                fn = getCss;
            if (len >= 3) {
                fn = setCss;
            }
            if (len === 2 && typeof arg[1] === 'object') {
                fn = setGroupCss;
            }
            return fn(...arg);
        };

        //=>EACH：遍历对象、数组、类数组
        let each = (obj, callback) => {
            if ('length' in obj) {
                for (let i = 0; i < obj.length; i++) {
                    let item = obj[i],
                        res = callback && callback.call(item, i, item);
                    if (res === false) {
                        break;
                    }
                }
                return;
            }
            for (let attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    let item = obj[attr],
                        res = callback && callback.call(item, attr, item);
                    if (res === false) {
                        break;
                    }
                }
            }
        };

        return {css, each}
    })();

//=>ANIMATE动画库
    ~function () {
        //=>匀速运动公式
        let effect = {
            Linear: (t, b, c, d) => t / d * c + b,

            BounceeaseOut: (t, b, c, d) => {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            },
            BounceeaseIn: (t, b, c, d) => c - effect.BounceeaseOut(d - t, 0, c, d) + b,

            BounceeaseInOut: (t, b, c, d) => {
                if (t < d / 2) {
                    return effect.BounceeaseIn(t * 2, 0, c, d) * .5 + b;
                }
                return effect.BounceeaseOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            }


        };

        //=>开始运动
        window.animate = function animate(ele, target, duration = 1000, callback, playEffect) {
            //=>参数处理(传递三个值,第三个值是函数,其实本身想要代表的意思：第三个是回调函数，总时间是默认值即可)
            if (typeof duration === 'function') {
                callback = duration;
                duration = 1000;
            } else if (typeof callback === 'string') {
                playEffect = callback;
                callback = function () {
                };
            } else if (typeof duration === 'string') {
                playEffect = duration;
                duration = 1000;
            }

            //=>准备数据
            let time = 0,
                begin = {},
                change = {};
            utils.each(target, (key, value) => {
                begin[key] = utils.css(ele, key);
                change[key] = value - begin[key];
            });

            //=>设置新动画之前清除原有正在运行的动画
            clearInterval(ele.animateTimer);
            ele.animateTimer = setInterval(() => {
                time += 17;
                //->动画结束
                if (time >= duration) {
                    clearInterval(ele.animateTimer);
                    utils.css(ele, target);
                    callback && callback.call(ele);
                    return;
                }
                //->获取每个方向的当前位置，并且给元素设置
                utils.each(target, (key, value) => {
                    let cur = effect[playEffect](time, begin[key], change[key], duration);
                    utils.css(ele, key, cur);
                });
            }, 17);
        };
    }();
}(window)



