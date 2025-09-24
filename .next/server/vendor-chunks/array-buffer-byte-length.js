"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/array-buffer-byte-length";
exports.ids = ["vendor-chunks/array-buffer-byte-length"];
exports.modules = {

/***/ "(rsc)/./node_modules/array-buffer-byte-length/index.js":
/*!********************************************************!*\
  !*** ./node_modules/array-buffer-byte-length/index.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar callBound = __webpack_require__(/*! call-bound */ \"(rsc)/./node_modules/call-bound/index.js\");\nvar $byteLength = callBound('ArrayBuffer.prototype.byteLength', true);\n\nvar isArrayBuffer = __webpack_require__(/*! is-array-buffer */ \"(rsc)/./node_modules/is-array-buffer/index.js\");\n\n/** @type {import('.')} */\nmodule.exports = function byteLength(ab) {\n\tif (!isArrayBuffer(ab)) {\n\t\treturn NaN;\n\t}\n\treturn $byteLength ? $byteLength(ab) : ab.byteLength;\n}; // in node < 0.11, byteLength is an own nonconfigurable property\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvYXJyYXktYnVmZmVyLWJ5dGUtbGVuZ3RoL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLGdCQUFnQixtQkFBTyxDQUFDLDREQUFZO0FBQ3BDOztBQUVBLG9CQUFvQixtQkFBTyxDQUFDLHNFQUFpQjs7QUFFN0MsV0FBVyxhQUFhO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbXktdjAtcHJvamVjdC8uL25vZGVfbW9kdWxlcy9hcnJheS1idWZmZXItYnl0ZS1sZW5ndGgvaW5kZXguanM/NzBkZCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBjYWxsQm91bmQgPSByZXF1aXJlKCdjYWxsLWJvdW5kJyk7XG52YXIgJGJ5dGVMZW5ndGggPSBjYWxsQm91bmQoJ0FycmF5QnVmZmVyLnByb3RvdHlwZS5ieXRlTGVuZ3RoJywgdHJ1ZSk7XG5cbnZhciBpc0FycmF5QnVmZmVyID0gcmVxdWlyZSgnaXMtYXJyYXktYnVmZmVyJyk7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuJyl9ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ5dGVMZW5ndGgoYWIpIHtcblx0aWYgKCFpc0FycmF5QnVmZmVyKGFiKSkge1xuXHRcdHJldHVybiBOYU47XG5cdH1cblx0cmV0dXJuICRieXRlTGVuZ3RoID8gJGJ5dGVMZW5ndGgoYWIpIDogYWIuYnl0ZUxlbmd0aDtcbn07IC8vIGluIG5vZGUgPCAwLjExLCBieXRlTGVuZ3RoIGlzIGFuIG93biBub25jb25maWd1cmFibGUgcHJvcGVydHlcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/array-buffer-byte-length/index.js\n");

/***/ })

};
;