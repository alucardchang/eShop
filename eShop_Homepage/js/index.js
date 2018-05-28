let clientH = document.documentElement.clientHeight,
    documentPage = document.documentElement,
    scrollT = null,
    topBtn = document.querySelector('.topBtn>a');

/*Menu Display*/
let menuNavi = () => {
    let $prodMenu = $('.mainMenu');
    $('body').on('mouseover', (ev) => {
        let target = ev.target,
            $target = null,
            tagName = target.tagName,
            $parEle = $(target).parents(),
            $list = $('.allCat'),
            $liEles = $list.children('li'),
            $menuLists = $prodMenu.children('ul');
        flag = $parEle.filter(".allCat").length > 0 ? true : false;
        (tagName === 'A' || tagName === 'SPAN' || tagName === 'EM' || tagName === 'DIV') ? $target = $(target).parents().filter('li') : $target = $(target);


        if ($target.length > 0 && flag) {
            // $prodMenu.css('display', 'block');
            $prodMenu.stop().fadeIn(250);
            $liEles.removeClass('active');
            $target.addClass('active');
            let listIndex = $target.attr('prodId');
            $menuLists.removeClass('active');
            $menuLists.each((index, item) => {
                $(item).attr('prodId') === listIndex ? $(item).addClass('active') : null;
            })
        }
        else {
            $prodMenu.css('display', 'none');
            // $prodMenu.stop().fadeOut(500);
            $liEles.removeClass('active');
            $menuLists.removeClass('active');
        }
    })

    $prodMenu.on('mouseover', (ev) => {
        ev.stopPropagation();
    })

};
menuNavi();

/*Menu Tag follow mouse*/
let menuTag = () => {
    let $menuList = $('.navList'),
        $lists = $('.navList li'),
        $tag = $('.navList>.wrapList'),
        tagL=$tag.offset().left;
    for (let i = 0; i < $lists.length; i++){
        $lists[i].offL=$lists.eq(i).offset().left;
        $lists[i].onmouseenter = function () {
            $tag.stop().animate({left:(this.offL-tagL)+"px"},300);
            $tag.css({width:$(this).width()});
        }
    }
};
menuTag();

/*To Page Top*/
let toTop = () => {
    console.log('ok');
        let isClicked = false;

/*    window.onscroll = function () {
        scrollT = document.documentElement.scrollTop;
        scrollT >= clientH ? utils.css(topBtn, 'display', 'block') : utils.css(topBtn, 'display', 'none');
    };*/


    topBtn.onclick = function () {
        if (isClicked === true) return;
        isClicked = true;
        let distance = document.documentElement.scrollTop,
            interval = 10,
            time = 200,
            step = distance / time * interval;
        let topTimer = setInterval(() => {
            distance = document.documentElement.scrollTop;
            if (distance <= 0) {
                document.documentElement.scrollTop = 0;
                clearInterval(topTimer);
                isClicked = false;
                return;
            }
            distance -= step;
            document.documentElement.scrollTop = distance;
        }, interval)
    }
};
toTop();

/*Elevator*/
let elevator = () => {
    let floors = document.querySelectorAll('.floor'),
        linksCont = document.querySelectorAll('.elevator>li'),
        links = document.querySelectorAll('.elevator>li>a'),
        elevBar = document.querySelector('.elevator'),
        scorllT = document.documentElement.scrollTop,
        floorsH = floors[0].offsetHeight,
        floorsOffTop = [],
        floorTag = ['龙鱼', '魟鱼', '虎鱼', '罗汉', '锦鲤', '其它', '器材'],
        lastIndex = 0,
        lastClick = null,
        isClicked = false,
        origText = links[lastIndex].innerText;
    let lightTag = (num) => {
        links[lastIndex].className = '';
        links[lastIndex].innerText = origText;
        linksCont[lastIndex].className = '';
        links[num].className = 'active';
        linksCont[num].className = 'active';
        origText = links[num].innerText;
        links[num].innerText = floorTag[num];
        lastIndex = num;
    };

    let goFloor = (index) => {
        let distance = document.documentElement.scrollTop - floorsOffTop[index],
            time = 260,
            interval = 17,
            step = Math.abs(distance / time * interval),
            dirt = "down",
            curPos = null;
        distance > 0 ? dirt = 'up' : void 0;
        let timer = setInterval(() => {
            curPos = document.documentElement.scrollTop;
            if (dirt === 'up') {
                curPos -= step;
                if (curPos <= floorsOffTop[index]) {
                    document.documentElement.scrollTop = floorsOffTop[index];
                    clearInterval(timer);
                    isClicked = false;
                    return;
                }
                document.documentElement.scrollTop = curPos;
            } else {
                curPos += step;
                if (curPos >= floorsOffTop[index]) {
                    document.documentElement.scrollTop = floorsOffTop[index];
                    clearInterval(timer);
                    isClicked = false;
                    return;
                }
                document.documentElement.scrollTop = curPos;

            }
        }, interval);
        lastClick = index;
    };


    [].forEach.call(floors, (item, index) => {
        //设置自定义index
        item.setAttribute("fIndex", index);
        floorsOffTop.push(utils.offset(item).top);

    });
    window.onscroll = function () {
        scrollT = document.documentElement.scrollTop;
        scrollT >= clientH ? utils.css(topBtn, 'display', 'block') : utils.css(topBtn, 'display', 'none');
        scrollT > floorsOffTop[0] ? utils.css(elevBar, "display", "block") : utils.css(elevBar, "display", "none");
        for (let i = 0; i < floorsOffTop.length; i++) {
            if (scrollT >= floorsOffTop[i] && document.documentElement.scrollTop <= floorsOffTop[i] + floorsH / 2) {
                // console.log(i);
                lightTag(i);
            } else if (scrollT >= floorsOffTop[i] + floorsH / 2 && scrollT <= floorsOffTop[i + 1]) {
                // console.log(i + 1);
                lightTag(i + 1);

            }

        }
    }

    for (let i = 0; i < links.length; i++) {
        links[i].cliIndex = i;
        links[i].onclick = function () {
            if (this.cliIndex === lastClick || isClicked === true) return;
            isClicked = true;
            console.log('active');
            goFloor(i);
        }
    }


}
elevator();


/*Banner Instance*/
let ban1 = new Slider(shopContainer, {
    url: 'json/banner.json',
    focusEvent: 'click',
    imgPreload: false,
    width: 1920,
    showArrow: false,
    playInterval: 3000,
    speed: 800,
    playEffect: 'BounceeaseInOut'
});

/*Tab Instance*/

let tab7 = new Tab('tabBox7', {
    eventType: 'mouseover',
    filePrefix: 'product7'
});


let tab6 = new Tab('tabBox6', {
    eventType: 'mouseover',
    filePrefix: 'product6'
});


let tab5 = new Tab('tabBox5', {
    eventType: 'mouseover',
    filePrefix: 'product5'
});

let tab4 = new Tab('tabBox4', {
    eventType: 'mouseover',
    filePrefix: 'product4'
});

let tab3 = new Tab('tabBox3', {
    eventType: 'mouseover',
    filePrefix: 'product3'
});

let tab2 = new Tab('tabBox2', {
    eventType: 'mouseover',
    filePrefix: 'product2'
});

let tab1 = new Tab('tabBox1', {
    eventType: 'mouseover',
    filePrefix: 'product1'
});






