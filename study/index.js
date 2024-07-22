const log = console.log;
let stopFlag = true;
let moveWheel1 = true;
let moveWheel2 = false;
let wheelTimer;
const data = {
  scrollHeight: document.documentElement.scrollHeight, // 滚动区总高度
  clientHeight: document.documentElement.clientHeight, // 可视窗口高度
  sections: document.getElementsByTagName("section"), // 所有section节点
  animateMomentInfo: {},
  videoReady: false
};
const getNode = (() => {
  return {
    id: (tag) => {
      return document.getElementById(tag)
    },
    class: (tag) => {
      return document.getElementsByClassName(tag)[0]
    }
  }
})()

// 判断滑动是否停止
function stopWheel() {
  if (moveWheel2 === true) {
    stopFlag = true
    clearInterval(timer)
    timer = null
    moveWheel2 = false;
    moveWheel1 = true;
  }
}

// 判断是否滚动，及其方向
function moveWheel(e) {
  e = e || window.Event;
  if (moveWheel1 === true) {
    if (e.wheelDelta) {
      stopFlag = false
      if (e.wheelDelta > 0) {
        console.log("mouse up scroll")
      }
      if (e.wheelDelta < 0) {
        console.log("mouse down scroll")
      }
    }
    moveWheel1 = false;
    moveWheel2 = true;
    // 200毫秒不滚动就判定停止滚动
    wheelTimer = setTimeout(stopWheel, 150);
  } else {
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(stopWheel, 100);
  }
}


// 计算每个section的动画触发时机，例如head在0.12-0.32之间触发，存入animateMomentInfo
function countAnimateMomentInfo() {
  for (const node of data.sections) {
    data.animateMomentInfo[node.id] = blockAnimateStart(node)
  }
}

/**
 * 计算当前位置距离顶部高度占整个页面的百分比,即当前滚动进度/比例
 * @param scrollTop 当前位置
 * @returns {number} 滚动进度0.0000-1.0000
 */
function countScrollRatio(scrollTop) {
  return Number((100 * scrollTop / (data.scrollHeight - data.clientHeight)).toFixed(4))
}

/**
 * 根据section的高度，计算它在页面的位置，得出一个section的动画在什么滚动比例触发
 * @param node 节点
 * @returns {{end: number, begin: number}} 开始滚动比例，结束滚动比例
 */
function blockAnimateStart(node) {
  let begin = countScrollRatio(node.offsetTop);// 节点头部距离页面顶部距离，占页面比例，例如xx节点头部在页面20%高度位置
  let end = countScrollRatio(node.offsetTop + node.clientHeight)// 节点底部距离页面顶部距离
  return { begin, end }
}

/**
 *计算当前动画应该执行到哪个区块，并计算该区块动画进度传入动画分发函数
 * @param rate 当前滚动进度
 */
function activateAnimate(rate) {
  for (let key in data.animateMomentInfo) {
    let { begin, end } = data.animateMomentInfo[key];
    if (rate > begin && rate < end) {
      // log(`进入${key},动画进度${((rate-begin)/(end-begin)).toFixed(3)}`)
      executeAnimate(key, Number(((rate - begin) / (end - begin)).toFixed(3)))
    }
  }
}

// 根据当前id，分发动画执行函数
function executeAnimate(id, rate) {
  switch (id) {
    case "head":
      headAnimate(rate)
      break
    case "head2":
      head2Animate(rate)
      break
    case "intro":
      introAnimate(rate)
      break
    case "tech":
      techAnimate(rate)
      break
    case "company":
      companyAnimate(rate)
      break
    default:
      log("no action")
  }
}

let nameParent = getNode.class("head-text-box") //名字的父级节点
let nameParentWidth = nameParent.clientWidth //名字父级宽度
const defaultFontSize = Number(window.getComputedStyle(nameParent).fontSize.slice(0, -2)) // 初始字体大小
let setSize = defaultFontSize // 设置字体大小，默认大小起步
let beforeRate = 0 // 存储上次的进度
let maxSize = 150//字体最大尺寸，刚好顶到边框
let nameZoom = getNode.id("name-label");
let videoLabel = getNode.id("head-video");
let videoSection = getNode.id("head2")
let headMeet = false //头像是否重合
let opacityRate = 0 //视频层透明比例
let jumpNode = getNode.class("jump-bar")

// 第一区块动画执行函数
function headAnimate(rate) {
  // log(rate)
  // 根据距离顶部距离判断字母和头像是否重合
  let _margin = Math.abs(videoLabel.getBoundingClientRect().top - nameZoom.getBoundingClientRect().top)
  /* if (_margin < 5) {
       // videoSection.style.opacity = "1"
   } else if (rate > 0.8) {
       // // 开始控制头像透明度
       //     opacityRate = (1-rate)/0.2
       //     log(opacityRate)
       //     videoSection.style.opacity = `${opacityRate}`
   }*/
  nameParent.style.opacity = `${0.9 - rate}`
  jumpNode.style.opacity = `${1 - rate}`
  // 判断是否居中（撑满容器）
  if (nameZoom.getBoundingClientRect().width < nameParentWidth - 3 || true) {
    let nameNode = getNode.id("name-text") // 缩放目标节点
    let aimSize = (maxSize - defaultFontSize) * rate // 根据动画进度比例获取字体的目标大小
    // aimSize = rate>setRate?aimSize*1.5:aimSize*0.5
    // 判断是放大还是缩小，用于设置倍率
    // if (rate > beforeRate) {
    //     log("++")
    //     aimSize = aimSize * 1.5
    // } else {
    //     log("--")
    // }
    beforeRate = rate
    // 控制下字体缩放边界
    if (aimSize < defaultFontSize) aimSize = defaultFontSize
    if (aimSize > maxSize) aimSize = maxSize
    setSize = aimSize
    nameNode.style.fontSize = `${setSize}px`
  }
}

// TODO:视频在慢速滑动的时候，会出现轻微抖动现象，需优化
// TODO:用getNode取代原生，此处文字缩放速度调节快一点，放大没问题，缩小加速是是失效的
let aim = 3;
let timer;
let end;
let currProgress = 0; // 当前视频进度
const frameRate = 30;// 动画帧率，每秒渲染帧数量
const frameSpeedSecond = Number((1 / frameRate).toFixed(4));// 秒，单帧时长,即单次动画执行周期
const frameSpeedMs = frameSpeedSecond * 1000; //frameSpeedSecond 毫秒
const videoNode = document.getElementById("head-video")
let videoLength = 0 // 视频时长
const videoDefaultWidth = videoNode.getBoundingClientRect().width // 最初视频宽度
const maxVideoWidth = videoDefaultWidth * 2.5 //最大视频宽度
const zoomVideoRange = maxVideoWidth - videoDefaultWidth //计算出缩放范围
function head2Animate(rate) {
  jumpNode.style.opacity = '0'
  if (rate > 0.1 && rate < 0.2) {
    // 开始控制头像透明度
    opacityRate = rate / 0.2
    videoSection.style.opacity = `${opacityRate}`
  } else if (rate < 0.1) {
    videoSection.style.opacity = `0`
  }
  // 缩放动画开始
  videoNode.style.width = `${videoDefaultWidth + (zoomVideoRange * rate)}px`
  videoNode.style.height = `${videoDefaultWidth + (zoomVideoRange * rate)}px`
  // 进度动画开始，本次视频目标进度，秒
  aim = (rate * videoLength).toFixed(4)
  // log("============")
  // // log("curr："+curr)
  // log("aim："+aim)
  // // log("timer:"+timer)
  // // log("stopFlag:"+stopFlag)
  // log("=======\n")
  /*  每次触发的rate范围不平滑，需要把rate处理平滑再设置动画进度，例如视频进度data.videoNode.currentTime
    只要滑动没有停止，此计时器永远在以frameSpeedMs帧（frameSpeedMs毫秒执行一次，每次进退长度33毫秒）的速率执行视频进度修改
    每次触发headAnimate只是在改变它的执行终点，即aim
    */
  if (!timer) {
    // 用requestAnimationFrame根据帧率绘制或许是性能更好的方案
    timer = setInterval(() => {
      // 这个计时器本身要具备清除自己的能力
      if (stopFlag) {
        clearInterval(timer)
        return;
      }
      // 这个停止条件有问题，实际无法触发
      // if(curr === aim){
      //     log("单次滑动执行完成")
      //     clearInterval(timer)
      //     return
      // }
      // 根据目标进度与当前进度关系判断前进还是后退
      currProgress < aim ? currProgress += frameSpeedSecond : currProgress -= frameSpeedSecond;
      videoNode.currentTime = currProgress; // 设置视频进度
    }, frameSpeedMs)
  }
}

const [doorNodeL, doorNodeR] = [getNode.id("door-l"), getNode.id("door-r")] // 左边门节点
const [doorChild1, doorChild2, doorChild3, doorChild4] = [getNode.id("door-child1"), getNode.id("door-child2"), getNode.id("door-child3"), getNode.id("door-child4")]
// 门下子元素
let doorWidth = doorNodeL.clientWidth //单个门宽度
function introAnimate(rate) {
  // log("into intro" + rate)
  // let node = document.getElementById("intro");
  // node.innerHTML = rate;
  // if (rate > 0.99) node.style.position = "relative";
}

let zoomChild;

function techAnimate(rate) {
  if (!zoomChild) {
    zoomChild = (node, zoomRate) => {
      // 子元素的缩放和渐变动画
      zoomRate = zoomRate * 100;
      if (zoomRate < 0.3) {
        node.style.opacity = '0'
      } else {
        [node.style.width, node.style.height] = [`${zoomRate}%`, `${zoomRate}%`]
        node.style.fontSize = `${zoomRate / 2}%`
        node.style.opacity = `${1 - (zoomRate / 100)}`
      }
    }
  }
  // log("into tech" + rate)
  if (rate < 0.2) {
    let _rate = rate * 5 //动画需在前1/5时间完成。而动画行程不变，所以动画要以5倍速度进行
    doorNodeL.style.left = `-${_rate * doorWidth}px`
    doorNodeR.style.right = `-${_rate * doorWidth}px`;
    doorNodeL.style.opacity = `${1 - _rate}`
    doorNodeR.style.opacity = `${1 - _rate}`
    doorChild1.style.opacity = '0'
    doorChild2.style.opacity = '0'
    doorChild3.style.opacity = '0'
    doorChild4.style.opacity = '0'
    // log(0.2)
  } else if (rate < 0.4) {
    /*
    按比例加快至5倍进度
    例如此子动画分配在整体动画20%-40%区间完成，整体动画执行到25%时，子动画应该（25%-20%）*5，
    即子动画执行20%进度
     */
    let _rate = (rate - 0.2) * 5
    zoomChild(doorChild1, _rate)
  } else if (rate < 0.6) {
    let _rate = (rate - 0.4) * 5
    zoomChild(doorChild2, _rate)
  } else if (rate < 0.8) {
    let _rate = (rate - 0.6) * 5
    zoomChild(doorChild3, _rate)
  } else if (rate < 1) {
    let _rate = (rate - 0.8) * 7.5 //最后一个动画加快1.5倍，不然到底还没执行完
    zoomChild(doorChild4, _rate)
  }

}

let [bar1, bar2, bar3, bar4] = [getNode.id("bar1"), getNode.id("bar2"), getNode.id("bar3"), getNode.id("bar4")]
let barWidth = bar1.clientWidth //单个bar的宽度
function companyAnimate(rate) {
  // log("into company" + rate)
  let aim = rate * barWidth //0.1控制速率
  bar1.scrollTo(aim, 0)
  bar2.scrollTo(barWidth - aim, 0)
  bar3.scrollTo(aim, 0)
  bar4.scrollTo(barWidth - aim, 0)
}

// 视频操作测试类
class testVideo {
  // 测试按帧率播放视频（实测webm性能差，会卡顿，换mp4）
  videoFramePlayTest() {
    let frames = 40;// 每秒帧量
    let frameSpeed = (1 / frames).toFixed(4); //单帧时长
    let loopTimer = setInterval(() => {
      if (videoNode.currentTime + frameSpeed > videoLength) clearInterval(loopTimer);
      // 这里每帧视频增加进度可以直接使用frameSpeed
      videoNode.currentTime = videoNode.currentTime + frameSpeed;
      // log(data.videoNode.currentTime)
    }, frameSpeed * 1000)
  }

  // 模拟按间隔n秒改变一个变量的值为n，例如3秒后把aim改为3，5秒后把aim改为5
  loopCallMock() {
    let timeArr = [5, 7, 10, 2, 9, 12]
    let timer2 = (arr) => {
      if (!arr.length) {
        log("test over")
        return
      }
      stopFlag = false
      let currStep = arr.shift();
      aim = currStep;
      log(`aim change:${currStep}`)
      setTimeout(() => {
        log(`next loop time:${arr[0]}`)
        timer2(arr)
      }, currStep * 1000)
    }
    timer2(timeArr)
  }

  // 匀速执行函数
  speedFun() {
    if (stopFlag) {
      clearInterval(timer)
      return
    }
    timer = setInterval(() => {
      if (stopFlag) {
        clearInterval(timer)
      }
      if (currProgress === aim) {
        log("at end aim")
        return
      }
      currProgress < aim ? currProgress++ : currProgress--;
      log(`1 second log this,curr:${curr},aim:${aim}`)
    }, 1000)
  }

  // 对视频帧进行缓存
  async extractFramesFromVideo(videoUrl, fps = 25) {
    return new Promise(async (resolve) => {
      // fully download it first (no buffering):
      let videoBlob = await fetch(videoUrl).then(r => r.blob());
      let videoObjectUrl = URL.createObjectURL(videoBlob);
      let video = document.createElement("video");

      let seekResolve;
      video.addEventListener('seeked', async function () {
        if (seekResolve) seekResolve();
      });

      video.addEventListener('loadeddata', async function () {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let [w, h] = [video.videoWidth, video.videoHeight]
        canvas.width = w;
        canvas.height = h;

        let frames = [];
        let interval = 1 / fps;
        let currentTime = 0;
        let duration = video.duration;

        while (currentTime < duration) {
          video.currentTime = currentTime;
          await new Promise(r => seekResolve = r);

          context.drawImage(video, 0, 0, w, h);
          let base64ImageData = canvas.toDataURL();
          frames.push(base64ImageData);

          currentTime += interval;
        }
        resolve(frames);
      });

      // set video src *after* listening to events in case it loads so fast
      // that the events occur before we were listening.
      video.src = videoObjectUrl;

    });
  }
}

// 初始化交错元素滚动位置
function initScrollPosition() {
  const [bar2, bar4] = [getNode.id("bar2"), getNode.id("bar4")]
  bar2.scrollTo(999, 0)
  bar4.scroll(999, 0)
}

(function onload() {
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  videoNode.oncanplay = async () => {
    // 防止视频进度一设置，就触发这个视频缓冲完成的事件
    if (data.videoReady) return;
    videoNode.volume = 0;
    timer = null
    videoLength = Number(videoNode.duration);
    data.videoReady = true;
    // 帧缓冲方案
    // let frames = await extractFramesFromVideo(data.videoNode.baseURI);
  }
  countAnimateMomentInfo()
  initScrollPosition()
})()
window.onscroll = (e) => {
  document.addEventListener('wheel', moveWheel, false);
  let top = document.documentElement.scrollTop
  activateAnimate(countScrollRatio(top))
}