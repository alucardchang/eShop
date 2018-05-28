/*
* 私有属性:
* 选项卡容器
* 页卡容器className,默认值:option
* 内容区className，默认值:con
* 选中页卡的索引，默认值:0
* 切换触发的事件，默认:click
* */

~function () {
    class Tab {
        constructor(elem, prop = {}) {
            //Check validity of elem parameter
            let container = null;
            if (typeof elem === 'string') {
                container = document.querySelector(`.${elem}`) || document.querySelector(`#${elem}`);
                if (container === null) {
                    throw new SyntaxError(`Element ${elem} does not exist!`);
                }
                this.container = container;
            }
            else if (typeof elem === 'undefined' || elem.nodeType !== 1) {
                throw new SyntaxError("Parameter container is required and it must be an element");
            } else {
                this.container = elem;
            }
            //Get items defined in prop object
            let defaultProp = {
                tabClass: 'option',
                conClass: 'con',
                defaultIndex: 0,
                eventType: 'click',
                filePrefix: '', /*JSON File Name Prefix*/
                callBack: function () {
                }
            };
            for (let key in prop) {
                if (prop.hasOwnProperty(key)) {
                    defaultProp[key] = prop[key]
                }
            }
            for (let key in defaultProp) {
                if (defaultProp.hasOwnProperty(key)) {
                    this[key] = defaultProp[key]
                }
            }

            this.init();
            this.switchTab();
        }

        /*Initiate tab instance*/
        init() {
            this.children = [...this.container.children];
            this.option = this.children.filter(item => this.hasClass(item, this.tabClass));
            this.option.length > 0 ? this.option = this.option[0] : null;
            this.conList = this.children.filter(item => this.hasClass(item, this.conClass));
            if (this.option === null || this.conList.length === 0) return;
            this.optionList = [].filter.call(this.option.children, elem => elem.tagName === 'LI');

            this.optionList.forEach((item, index) => {
                    if (index === this.defaultIndex) {
                        this.addClass(this.optionList[index], 'active');
                        this.getData(index);
                        this.bindData(this['prodData'],index);

                        return;
                    }
                    this.removeClass(this.optionList[index], 'active');
                }
            );


        }

        /*Confirm element classname*/
        hasClass(elem, classStr) {
            return elem.className.trim().split(/ +/).indexOf(classStr) >= 0;
        }

        /*Add class name for element*/
        addClass(elem, classStr) {
            if (this.hasClass(elem, classStr)) return;
            elem.className += ` ${classStr}`;
        }

        /*Remove class name for element*/
        removeClass(elem, classStr) {
            if (!this.hasClass(elem, classStr)) return;
            let classAry = elem.className.trim().split(/ +/);
            classAry = classAry.filter(item => item !== classStr);
            elem.className = classAry.join(' ');
        }

        /*Tab Switch*/
        switchTab() {
            let _this = this; //this是当前的实例
            this.optionList.forEach((item, index) =>
                item[`on${_this.eventType}`] = function () {
                    if (index === _this.defaultIndex) return;
                    _this.addClass(this, 'active');

                    _this.bindData(_this['prodData'],index);


                    _this.removeClass(_this.optionList[_this.defaultIndex], 'active');

                    _this.defaultIndex = index;
                    _this.callBack && _this.callBack();

                })
        }

        /*Require Data*/
        getData(page) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', `json/${this.filePrefix}.json`, false);
            /*page equals index plus 1*/
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    this['prodData'] = JSON.parse(xhr.responseText);

                }
            }
            xhr.send(null);
        }

        /*Bind Data*/
        bindData(data,page) {
            let str = ``;
            for (let i = 0; i < data[page].length; i++) {
                let {title, price, img} = data[page][i];
                str += `<div class="goods">
                    <a href="javascript"><img src="${img}"></a>
                    <p><a href="javascript">${title}</a></p>
                    <span>￥${price}</span>
                    <a href="javascript"></a>
                </div>`
            }
            this.conList[0].innerHTML = str;  /*Only one con div needs to update data*/
        }
    }
    window.Tab = Tab;
}()