// 加载图片
class LoadPic {
  static COUNT = 30;
  constructor() {
    this.load()
  }
  load() {
    for (let i = 1; i < LoadPic.COUNT; i++) {
      const img = new Image();
      img.src = `./img/${i + 1}.jpg`;
    }
  }
}

// 基础触发方法
class BaseTrigger {
  trigger(scrollTop) {
    // TODO
  }
}

// 画canvas
class ImgTrigger extends BaseTrigger {
  static WIDTH = window.innerWidth;
  static HEIGHT = window.innerHeight;

  canvas = document.getElementById("demo");
  context = this.canvas.getContext("2d");
  img = new Image()

  getCurrentImg(index) {
    return `./img/${index}.jpg`;
  }

  constructor() {
    super();
    this.initDraw();
    this.canvas.width = ImgTrigger.WIDTH;
    this.canvas.height = ImgTrigger.HEIGHT;
  }

  drawImg(img) {
    this.context.drawImage(img, 0, 0, ImgTrigger.WIDTH, ImgTrigger.HEIGHT);
  }

  // 初始化第一张图片
  initDraw() {
    this.img.src = this.getCurrentImg(1);
    this.img.onload = () => {
      this.context.clearRect(0, 0, ImgTrigger.WIDTH, ImgTrigger.HEIGHT);
      this.drawImg(this.img);
    }
  }


  updateImg(index) {
    this.img.src = this.getCurrentImg(index);
  }


  interval = [
    { pic: [1, 5], length: {} },
    { pic: [6, 10], length: {} },
    { pic: [11, 15], length: {} },
    { pic: [16, 20], length: {} },
    { pic: [21, 25], length: {} },
    { pic: [26, 30], length: {} }
  ]


  setEachRange(totalScroll) {

    const rangeLength = 100;

    const rangeCount = this.interval.length - 1;


    for (let i = 0; i < this.interval.length; i++) {
      console.log(this.interval[i]);

    }

  }

  trigger(height, scrollTop) {
    const maxScrollTop = height - window.innerHeight;

    console.log(scrollTop, maxScrollTop);


    if (!this.interval[0].length.end) {
      this.setEachRange(maxScrollTop)
    }

    const scrollFraction = scrollTop / maxScrollTop;
    const index = Math.min(
      LoadPic.COUNT - 1,
      Math.ceil(scrollFraction * LoadPic.COUNT)
    );
    requestAnimationFrame(() => this.updateImg(index + 1))
  }

}

class TextTrigger extends BaseTrigger {
  constructor() {
    super()
  }
  trigger() {
    // console.log(11);
  }
}

class DynamicEffect {
  static SCROLLHEIGHT = document.documentElement.scrollHeight
  triggerList = [
    new ImgTrigger(),
    new TextTrigger()
  ]
  constructor() {
    new LoadPic();
    this.handleScroll();
  }
  handleScroll() {
    window.addEventListener("scroll", () => {
      const scrollTop = document.documentElement.scrollTop;
      this.triggerList.forEach(i => i.trigger(DynamicEffect.SCROLLHEIGHT, scrollTop))
    })
  }
}



new DynamicEffect()

