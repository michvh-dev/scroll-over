import { VirtualScroll } from "@michvh-dev/virtual-scroll";
import { easeInQuad } from "./utils/ease";

interface ScrollElement {
  target: HTMLElement;
  id?: string;
  startScroll: number;
  start: number;
  end: number;
  hasScroll: boolean;
}
interface ScrollConfig {
  elements?: Element[];
  elementSelector?: string;
}

class Scroll {
  config: ScrollConfig;
  targetElements: Element[] = [];
  scrollElements: ScrollElement[] = [];
  currentScroll = 0;
  maxScrollY = 0;
  constructor(config: ScrollConfig) {
    this.config = config;
    this.setTargets();
    this.calculateScollElements();
    this.setEventListeners();
  }

  setTargets() {
    const { elements, elementSelector } = this.config;
    if (elements) {
      this.targetElements = elements;
    } else if (elementSelector) {
      this.targetElements = [...document.querySelectorAll(elementSelector)];
    } else {
      throw Error("dsfdsfs");
    }
  }
  setScrollPosition() {
    this.scrollElements.forEach((el) => {
      if (el.start <= this.currentScroll && !el.hasScroll) {
        el.target.style.transform = "translateY(0)";
      } else if (el.start <= this.currentScroll && el.hasScroll) {
        el.target.style.transform = "translateY(0)";
        el.target.style.overflow = "hidden";
        el.target.scrollTop = this.currentScroll - el.start;
      } else if (
        el.startScroll < this.currentScroll &&
        el.start > this.currentScroll
      ) {
        var translate = el.start - this.currentScroll;
        el.target.style.transform = "translateY(" + translate + "px)";
        el.target.scrollTop = 0;
      } else {
        el.target.style.transform = "translateY(" + window.innerHeight + "px)";
      }
    });
  }

  setCurrentScrollPosition(position: number, save = true) {
    if (position < 0) {
      position = 0;
    }
    if (position > this.maxScrollY) {
      position = this.maxScrollY;
    }
    this.currentScroll = position;
    if (save) {
      localStorage.setItem("home.currentScroll", `${this.currentScroll}`);
    }

    this.setScrollPosition();
  }

  goToSectionId(id: string) {
    var anchor = id.split("#")[1];

    var element = this.scrollElements.find((el) => {
      return el.id === anchor;
    });
    if (!element) {
      return;
    }

    var diffScroll = element.start - this.currentScroll;
    var time = 0;
    var totalTime = Math.abs(diffScroll) > 1000 ? 400 : 200;
    for (var i = 1; i < 61; i++) {
      setTimeout(() => {
        var scroll = this.currentScroll + diffScroll / 60;
        this.setCurrentScrollPosition(scroll);
      }, time);
      time = easeInQuad(i, 0, totalTime, 60);
    }
  }

  calculateScollElements() {
    this.maxScrollY = 0;
    var scrollCheck = 0;
    for (var i = 0; i < this.targetElements.length; i++) {
      var element = this.targetElements[i];
      var scrollPositionStart = scrollCheck;
      var scrollPositionEnd =
        scrollPositionStart + element.scrollHeight - window.innerHeight;
      this.maxScrollY = scrollPositionEnd;
      scrollCheck = scrollPositionStart + element.scrollHeight;
      const object = {
        target: element as HTMLElement,
        id: element.id,
        startScroll:
          scrollPositionStart > 0 ? this.scrollElements[i - 1].end : 0,
        start: scrollPositionStart,
        hasScroll: element.scrollHeight !== window.innerHeight,
        end: scrollPositionEnd,
      };
      object.target.style.position = "fixed";
      object.target.style.width = "100%";
      object.target.style.left = "0px";
      object.target.style.top = "0px";
      object.target.style.zIndex = `${i + 1}`;
      this.scrollElements.push(object);
    }
  }

  mouseScroll = (e: WheelEvent) => {
    e.preventDefault();

    var scroll = this.currentScroll + e.deltaY;
  };

  handleKeyDownMove = (e: KeyboardEvent) => {
    if (e.key == "down") {
      this.setCurrentScrollPosition(this.currentScroll - 50);
    } else if (e.key == "up") {
      this.setCurrentScrollPosition(this.currentScroll + 50);
    }
  };
  scrollEventKey =
    "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

  setEventListeners() {
    const scroll = new VirtualScroll({
      horizontal: false,
      vertical: true,
      keyBoardOffset: 25,
    });
    debugger;
    scroll.on("scroll", (p) => {
      this.setCurrentScrollPosition(p.currentY);
    });
  }
}
export default Scroll;