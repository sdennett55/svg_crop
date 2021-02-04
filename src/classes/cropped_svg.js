// USER: Set either a width OR height (will scale evenly)
const WIDTH = null;
const HEIGHT = null;
const invisibleElems = [
  'defs',
  'g',
  'foreignObject',
  'svg',
  'style',
  'title',
  'desc',
];

class CroppedSVG {
  constructor(svg, filename, width, height) {
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

    this.render(this.svg);
  }

  removeAttributes() {
    this.svg.removeAttribute('viewBox');
    this.svg.removeAttribute('width');
    this.svg.removeAttribute('height');
  }

  filterSVGToVisibleElements(svg) {
    function flatten(ops, n) {
      ops.push(n);
      if (n.childNodes && n.childNodes.length) {
        [].reduce.call(n.childNodes, flatten, ops);
      }
      return ops;
    }

    const result = [svg].reduce(flatten, []).filter((elem) => {
      return (
        elem.tagName &&
        !invisibleElems.includes(elem.tagName) &&
        (elem.getBoundingClientRect().width ||
          elem.getBoundingClientRect().height) &&
        !elem.parentElement.hasAttribute('mask') &&
        elem.parentElement.tagName !== 'defs' &&
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
        getComputedStyle(x)['stroke-width'].replace('px', '')
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

  static formatViewBoxNum(num) {
    return num.toFixed(2) * 1;
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

    this.svg.parentElement.classList.add('is-showingSvg');

    if (WIDTH) {
      this.svg.setAttribute('width', WIDTH);
      this.svg.removeAttribute('height');
    } else if (HEIGHT) {
      this.svg.setAttribute('height', HEIGHT);
      this.svg.removeAttribute('width');
    }
  }

  addSvg() {
    function handleImageEnhance(e) {
      e.target.classList.toggle('is-enhanced');
    }

    // Add SVG to the screen inside the enhance button
    const enhanceBtn = document.createElement('button');
    enhanceBtn.classList.add('EnhanceButton');
    enhanceBtn.addEventListener('click', handleImageEnhance);
    enhanceBtn.appendChild(this.svg);
    const previewSectionElem = document.querySelector('.PreviewSection');
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