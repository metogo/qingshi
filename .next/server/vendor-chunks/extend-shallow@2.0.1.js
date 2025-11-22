"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/extend-shallow@2.0.1";
exports.ids = ["vendor-chunks/extend-shallow@2.0.1"];
exports.modules = {

/***/ "(rsc)/./node_modules/.pnpm/extend-shallow@2.0.1/node_modules/extend-shallow/index.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/.pnpm/extend-shallow@2.0.1/node_modules/extend-shallow/index.js ***!
  \**************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nvar isObject = __webpack_require__(/*! is-extendable */ \"(rsc)/./node_modules/.pnpm/is-extendable@0.1.1/node_modules/is-extendable/index.js\");\nmodule.exports = function extend(o /*, objects*/ ) {\n    if (!isObject(o)) {\n        o = {};\n    }\n    var len = arguments.length;\n    for(var i = 1; i < len; i++){\n        var obj = arguments[i];\n        if (isObject(obj)) {\n            assign(o, obj);\n        }\n    }\n    return o;\n};\nfunction assign(a, b) {\n    for(var key in b){\n        if (hasOwn(b, key)) {\n            a[key] = b[key];\n        }\n    }\n}\n/**\n * Returns true if the given `key` is an own property of `obj`.\n */ function hasOwn(obj, key) {\n    return Object.prototype.hasOwnProperty.call(obj, key);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vZXh0ZW5kLXNoYWxsb3dAMi4wLjEvbm9kZV9tb2R1bGVzL2V4dGVuZC1zaGFsbG93L2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBRUEsSUFBSUEsV0FBV0MsbUJBQU9BLENBQUM7QUFFdkJDLE9BQU9DLE9BQU8sR0FBRyxTQUFTQyxPQUFPQyxFQUFDLFdBQVcsR0FBWDtJQUNoQyxJQUFJLENBQUNMLFNBQVNLLElBQUk7UUFBRUEsSUFBSSxDQUFDO0lBQUc7SUFFNUIsSUFBSUMsTUFBTUMsVUFBVUMsTUFBTTtJQUMxQixJQUFLLElBQUlDLElBQUksR0FBR0EsSUFBSUgsS0FBS0csSUFBSztRQUM1QixJQUFJQyxNQUFNSCxTQUFTLENBQUNFLEVBQUU7UUFFdEIsSUFBSVQsU0FBU1UsTUFBTTtZQUNqQkMsT0FBT04sR0FBR0s7UUFDWjtJQUNGO0lBQ0EsT0FBT0w7QUFDVDtBQUVBLFNBQVNNLE9BQU9DLENBQUMsRUFBRUMsQ0FBQztJQUNsQixJQUFLLElBQUlDLE9BQU9ELEVBQUc7UUFDakIsSUFBSUUsT0FBT0YsR0FBR0MsTUFBTTtZQUNsQkYsQ0FBQyxDQUFDRSxJQUFJLEdBQUdELENBQUMsQ0FBQ0MsSUFBSTtRQUNqQjtJQUNGO0FBQ0Y7QUFFQTs7Q0FFQyxHQUVELFNBQVNDLE9BQU9MLEdBQUcsRUFBRUksR0FBRztJQUN0QixPQUFPRSxPQUFPQyxTQUFTLENBQUNDLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDVCxLQUFLSTtBQUNuRCIsInNvdXJjZXMiOlsid2VicGFjazovL3FpbmdzaGktY2Fsb3JpZS1jYWxjdWxhdG9yLy4vbm9kZV9tb2R1bGVzLy5wbnBtL2V4dGVuZC1zaGFsbG93QDIuMC4xL25vZGVfbW9kdWxlcy9leHRlbmQtc2hhbGxvdy9pbmRleC5qcz80MjZlIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnaXMtZXh0ZW5kYWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZChvLyosIG9iamVjdHMqLykge1xuICBpZiAoIWlzT2JqZWN0KG8pKSB7IG8gPSB7fTsgfVxuXG4gIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIG9iaiA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGlmIChpc09iamVjdChvYmopKSB7XG4gICAgICBhc3NpZ24obywgb2JqKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG87XG59O1xuXG5mdW5jdGlvbiBhc3NpZ24oYSwgYikge1xuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGlmIChoYXNPd24oYiwga2V5KSkge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gYGtleWAgaXMgYW4gb3duIHByb3BlcnR5IG9mIGBvYmpgLlxuICovXG5cbmZ1bmN0aW9uIGhhc093bihvYmosIGtleSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbn1cbiJdLCJuYW1lcyI6WyJpc09iamVjdCIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiZXh0ZW5kIiwibyIsImxlbiIsImFyZ3VtZW50cyIsImxlbmd0aCIsImkiLCJvYmoiLCJhc3NpZ24iLCJhIiwiYiIsImtleSIsImhhc093biIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/extend-shallow@2.0.1/node_modules/extend-shallow/index.js\n");

/***/ })

};
;