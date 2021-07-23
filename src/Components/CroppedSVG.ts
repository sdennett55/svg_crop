const invisibleElems = [
  'defs',
  'g',
  'foreignObject',
  'svg',
  'style',
  'title',
  'desc',
];

interface Coords {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

class CroppedSVG {
  coords: Coords;

  constructor(public svg: SVGElement, public filename: string, public width: number, public height: number) {
    this.width = width;
    this.height = height;
    this.filename = filename;
    this.coords = {
      top: Infinity,
      left: Infinity,
      bottom: -Infinity,
      right: -Infinity,
    };
    this.svg = svg;

    this.render();
  }

  removeAttributes() {
    this.svg.removeAttribute('viewBox');
    this.svg.removeAttribute('width');
    this.svg.removeAttribute('height');
  }

  filterSVGToVisibleElements(svg: SVGElement) {
    function flatten(ops: SVGElement[], n: SVGElement) {
      ops.push(n);
      if (n.childNodes && n.childNodes.length) {
        // @ts-ignore: Unreachable code error
        [].reduce.call(n.childNodes, flatten, ops);
      }
      return ops;
    }

    const result = [svg].reduce(flatten, []).filter((elem: SVGElement) => {
      const parentElement = elem.parentElement as HTMLElement;
      return (
        elem.tagName &&
        !invisibleElems.includes(elem.tagName) &&
        (elem.getBoundingClientRect().width ||
          elem.getBoundingClientRect().height) &&
        !parentElement.hasAttribute('mask') &&
        parentElement.tagName !== 'defs' &&
        (getComputedStyle(elem).stroke !== 'none' ||
          getComputedStyle(elem).fill !== 'none')
      );
    });

    return result;
  }

  getCoords() {
    this.filterSVGToVisibleElements(this.svg).forEach((x, index, arr) => {
      let {
        top: newTop,
        left: newLeft,
        bottom: newBottom,
        right: newRight,
      } = x.getBoundingClientRect();

      const stroke = getComputedStyle(x)['stroke'];
      const strokeWidth = Number(
        getComputedStyle(x).strokeWidth.replace('px', '')
      );

      if (stroke !== 'none') {
        newTop = newTop - strokeWidth / 2;
        newLeft = newLeft - strokeWidth / 2;
        newBottom = newBottom + strokeWidth / 2;
        newRight = newRight + strokeWidth / 2;
      }

      if (newTop < this.coords.top) {
        this.coords.top = newTop;
      }
      if (newLeft < this.coords.left) {
        this.coords.left = newLeft;
      }
      if (newRight > this.coords.right) {
        this.coords.right = newRight;
      }
      if (newBottom > this.coords.bottom) {
        this.coords.bottom = newBottom;
      }
    });
  }

  static formatViewBoxNum(num: number) {
    return Number(num.toFixed(2)) * 1;
  }

  setNewAttributes() {
    this.svg.setAttribute(
      'viewBox',
      `${CroppedSVG.formatViewBoxNum(
        this.coords.left
      )} ${CroppedSVG.formatViewBoxNum(
        this.coords.top
      )} ${CroppedSVG.formatViewBoxNum(
        this.coords.right - this.coords.left
      )} ${CroppedSVG.formatViewBoxNum(this.coords.bottom - this.coords.top)}`
    );

    (this.svg.parentElement as HTMLElement).classList.add('is-showingSvg');
  }

  addSvg() {
    function handleImageEnhance(e: Event) {
      const target = e.target as HTMLElement;
      target.classList.toggle('is-enhanced');
    }

    // Add SVG to the screen inside the enhance button
    const enhanceBtn = document.createElement('button');
    enhanceBtn.classList.add('EnhanceButton');
    enhanceBtn.addEventListener('click', handleImageEnhance);
    enhanceBtn.appendChild(this.svg);
    const previewSectionElem = document.querySelector('.PreviewSection') as HTMLElement;
    previewSectionElem.appendChild(enhanceBtn);
  }

  render() {
    this.addSvg();
    this.removeAttributes();
    this.getCoords();
    this.setNewAttributes();
  }
}

export default CroppedSVG;
