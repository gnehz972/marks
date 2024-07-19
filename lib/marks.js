"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Waveline = exports.Underline = exports.Pane = exports.Mark = exports.Highlight = void 0;
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/web.dom-collections.iterator.js");
var _svg = _interopRequireDefault(require("./svg"));
var _events = _interopRequireDefault(require("./events"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Pane {
  constructor(target) {
    let container = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;
    this.target = target;
    this.element = _svg.default.createElement('svg');
    this.marks = [];

    // Match the coordinates of the target element
    this.element.style.position = 'absolute';
    // Disable pointer events
    this.element.setAttribute('pointer-events', 'none');

    // Set up mouse event proxying between the target element and the marks
    _events.default.proxyMouse(this.target, this.marks);
    this.container = container;
    this.container.appendChild(this.element);
    this.render();
  }
  addMark(mark) {
    var g = _svg.default.createElement('g');
    this.element.appendChild(g);
    mark.bind(g, this.container);
    this.marks.push(mark);
    mark.render();
    return mark;
  }
  removeMark(mark) {
    var idx = this.marks.indexOf(mark);
    if (idx === -1) {
      return;
    }
    var el = mark.unbind();
    this.element.removeChild(el);
    this.marks.splice(idx, 1);
  }
  render() {
    setCoords(this.element, coords(this.target, this.container));
    for (var m of this.marks) {
      m.render();
    }
  }
}
exports.Pane = Pane;
class Mark {
  constructor() {
    this.element = null;
  }
  bind(element, container) {
    this.element = element;
    this.container = container;
  }
  unbind() {
    var el = this.element;
    this.element = null;
    return el;
  }
  render() {}
  dispatchEvent(e) {
    if (!this.element) return;
    this.element.dispatchEvent(e);
  }
  getBoundingClientRect() {
    return this.element.getBoundingClientRect();
  }
  getClientRects() {
    var rects = [];
    var el = this.element.firstChild;
    while (el) {
      rects.push(el.getBoundingClientRect());
      el = el.nextSibling;
    }
    return rects;
  }
  filteredRanges() {
    if (!this.range) {
      return [];
    }

    // De-duplicate the boxes
    const rects = Array.from(this.range.getClientRects());
    const stringRects = rects.map(r => JSON.stringify(r));
    const setRects = new Set(stringRects);
    return Array.from(setRects).map(sr => JSON.parse(sr));
  }
}
exports.Mark = Mark;
class Highlight extends Mark {
  constructor(range, className, data, attributes) {
    super();
    this.range = range;
    this.className = className;
    this.data = data || {};
    this.attributes = attributes || {};
  }
  bind(element, container) {
    super.bind(element, container);
    for (var attr in this.data) {
      if (this.data.hasOwnProperty(attr)) {
        this.element.dataset[attr] = this.data[attr];
      }
    }
    for (var attr in this.attributes) {
      if (this.attributes.hasOwnProperty(attr)) {
        this.element.setAttribute(attr, this.attributes[attr]);
      }
    }
    if (this.className) {
      this.element.classList.add(this.className);
    }
  }
  render() {
    // Empty element
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    var docFrag = this.element.ownerDocument.createDocumentFragment();
    var filtered = this.filteredRanges();
    var offset = this.element.getBoundingClientRect();
    var container = this.container.getBoundingClientRect();
    for (var i = 0, len = filtered.length; i < len; i++) {
      var r = filtered[i];
      var el = _svg.default.createElement('rect');
      el.setAttribute('x', r.left - offset.left + container.left);
      el.setAttribute('y', r.top - offset.top + container.top);
      el.setAttribute('height', r.height);
      el.setAttribute('width', r.width);
      docFrag.appendChild(el);
    }
    this.element.appendChild(docFrag);
  }
}
exports.Highlight = Highlight;
class Underline extends Highlight {
  constructor(range, className, data, attributes) {
    super(range, className, data, attributes);
  }
  render() {
    // Empty element
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    var docFrag = this.element.ownerDocument.createDocumentFragment();
    var filtered = this.filteredRanges();
    var offset = this.element.getBoundingClientRect();
    var container = this.container.getBoundingClientRect();
    for (var i = 0, len = filtered.length; i < len; i++) {
      var r = filtered[i];
      var rect = _svg.default.createElement('rect');
      rect.setAttribute('x', r.left - offset.left + container.left);
      rect.setAttribute('y', r.top - offset.top + container.top);
      rect.setAttribute('height', r.height);
      rect.setAttribute('width', r.width);
      rect.setAttribute('fill', 'none');
      var line = _svg.default.createElement('line');
      line.setAttribute('x1', r.left - offset.left + container.left);
      line.setAttribute('x2', r.left - offset.left + container.left + r.width);
      line.setAttribute('y1', r.top - offset.top + container.top + r.height - 1);
      line.setAttribute('y2', r.top - offset.top + container.top + r.height - 1);
      line.setAttribute('stroke-width', this.attributes['stroke-width'] || 1);
      line.setAttribute('stroke', this.attributes['stroke'] || 'black'); //TODO: match text color?
      line.setAttribute('stroke-linecap', this.attributes['stroke-linecap'] || 'square');
      docFrag.appendChild(rect);
      docFrag.appendChild(line);
    }
    this.element.appendChild(docFrag);
  }
}
exports.Underline = Underline;
class Waveline extends Highlight {
  constructor(range, className, data, attributes) {
    super(range, className, data, attributes);
  }
  render() {
    // Empty element
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    var docFrag = this.element.ownerDocument.createDocumentFragment();
    var filtered = this.filteredRanges();
    var offset = this.element.getBoundingClientRect();
    var container = this.container.getBoundingClientRect();
    for (var i = 0, len = filtered.length; i < len; i++) {
      var r = filtered[i];
      var rect = _svg.default.createElement('rect');
      rect.setAttribute('x', r.left - offset.left + container.left);
      rect.setAttribute('y', r.top - offset.top + container.top);
      rect.setAttribute('height', r.height);
      rect.setAttribute('width', r.width);
      rect.setAttribute('fill', 'none');
      var wavePath = _svg.default.createElement('path');
      var startX = r.left - offset.left + container.left;
      var startY = r.top - offset.top + container.top + r.height - 1;
      var endX = startX + r.width;

      // Wave properties
      var amplitude = 2;
      var frequency = 10;
      var pathData = "M ".concat(startX, " ").concat(startY);
      for (let x = startX; x <= endX; x += 1) {
        let y = startY + amplitude * Math.sin((x - startX) * 2 * Math.PI / frequency);
        pathData += " L ".concat(x, " ").concat(y);
      }
      wavePath.setAttribute('d', pathData);
      wavePath.setAttribute('fill', this.attributes['fill'] || 'none');
      wavePath.setAttribute('stroke', this.attributes['stroke'] || 'black');
      wavePath.setAttribute('stroke-width', this.attributes['stroke-width'] || 1);
      wavePath.setAttribute('stroke-linecap', this.attributes['stroke-linecap'] || 'round');
      docFrag.appendChild(rect);
      docFrag.appendChild(wavePath);
    }
    this.element.appendChild(docFrag);
  }
}
exports.Waveline = Waveline;
function coords(el, container) {
  var offset = container.getBoundingClientRect();
  var rect = el.getBoundingClientRect();
  return {
    top: rect.top - offset.top,
    left: rect.left - offset.left,
    height: el.scrollHeight,
    width: el.scrollWidth
  };
}
function setCoords(el, coords) {
  el.style.setProperty('top', "".concat(coords.top, "px"), 'important');
  el.style.setProperty('left', "".concat(coords.left, "px"), 'important');
  el.style.setProperty('height', "".concat(coords.height, "px"), 'important');
  el.style.setProperty('width', "".concat(coords.width, "px"), 'important');
}
function contains(rect1, rect2) {
  return rect2.right <= rect1.right && rect2.left >= rect1.left && rect2.top >= rect1.top && rect2.bottom <= rect1.bottom;
}
