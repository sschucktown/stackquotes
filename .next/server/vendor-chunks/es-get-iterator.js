"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/es-get-iterator";
exports.ids = ["vendor-chunks/es-get-iterator"];
exports.modules = {

/***/ "(rsc)/./node_modules/es-get-iterator/node.js":
/*!**********************************************!*\
  !*** ./node_modules/es-get-iterator/node.js ***!
  \**********************************************/
/***/ ((module) => {

eval("\n\n// this should only run in node >= 13.2, so it\n// does not need any of the intense fallbacks that old node/browsers do\n\nvar $iterator = Symbol.iterator;\nmodule.exports = function getIterator(iterable) {\n\t// alternatively, `iterable[$iterator]?.()`\n\tif (iterable != null && typeof iterable[$iterator] !== 'undefined') {\n\t\treturn iterable[$iterator]();\n\t}\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvZXMtZ2V0LWl0ZXJhdG9yL25vZGUuanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL215LXYwLXByb2plY3QvLi9ub2RlX21vZHVsZXMvZXMtZ2V0LWl0ZXJhdG9yL25vZGUuanM/MDYyZCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8vIHRoaXMgc2hvdWxkIG9ubHkgcnVuIGluIG5vZGUgPj0gMTMuMiwgc28gaXRcbi8vIGRvZXMgbm90IG5lZWQgYW55IG9mIHRoZSBpbnRlbnNlIGZhbGxiYWNrcyB0aGF0IG9sZCBub2RlL2Jyb3dzZXJzIGRvXG5cbnZhciAkaXRlcmF0b3IgPSBTeW1ib2wuaXRlcmF0b3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldEl0ZXJhdG9yKGl0ZXJhYmxlKSB7XG5cdC8vIGFsdGVybmF0aXZlbHksIGBpdGVyYWJsZVskaXRlcmF0b3JdPy4oKWBcblx0aWYgKGl0ZXJhYmxlICE9IG51bGwgJiYgdHlwZW9mIGl0ZXJhYmxlWyRpdGVyYXRvcl0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0cmV0dXJuIGl0ZXJhYmxlWyRpdGVyYXRvcl0oKTtcblx0fVxufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/es-get-iterator/node.js\n");

/***/ })

};
;