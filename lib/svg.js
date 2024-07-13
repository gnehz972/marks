"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createElement = createElement;
exports.default = void 0;
function createElement(name) {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}
var _default = exports.default = {
  createElement: createElement
};
