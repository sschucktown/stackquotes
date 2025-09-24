"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/send-quote/route";
exports.ids = ["app/api/send-quote/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsend-quote%2Froute&page=%2Fapi%2Fsend-quote%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsend-quote%2Froute.ts&appDir=C%3A%5CUsers%5Cu329702%5CIdeaProjects%5Cstackquotes%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cu329702%5CIdeaProjects%5Cstackquotes&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsend-quote%2Froute&page=%2Fapi%2Fsend-quote%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsend-quote%2Froute.ts&appDir=C%3A%5CUsers%5Cu329702%5CIdeaProjects%5Cstackquotes%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cu329702%5CIdeaProjects%5Cstackquotes&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_u329702_IdeaProjects_stackquotes_app_api_send_quote_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/send-quote/route.ts */ \"(rsc)/./app/api/send-quote/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/send-quote/route\",\n        pathname: \"/api/send-quote\",\n        filename: \"route\",\n        bundlePath: \"app/api/send-quote/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\u329702\\\\IdeaProjects\\\\stackquotes\\\\app\\\\api\\\\send-quote\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_u329702_IdeaProjects_stackquotes_app_api_send_quote_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/send-quote/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzZW5kLXF1b3RlJTJGcm91dGUmcGFnZT0lMkZhcGklMkZzZW5kLXF1b3RlJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGc2VuZC1xdW90ZSUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUN1MzI5NzAyJTVDSWRlYVByb2plY3RzJTVDc3RhY2txdW90ZXMlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q3UzMjk3MDIlNUNJZGVhUHJvamVjdHMlNUNzdGFja3F1b3RlcyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDNkI7QUFDMUc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teS12MC1wcm9qZWN0Lz85MTg1Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXHUzMjk3MDJcXFxcSWRlYVByb2plY3RzXFxcXHN0YWNrcXVvdGVzXFxcXGFwcFxcXFxhcGlcXFxcc2VuZC1xdW90ZVxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvc2VuZC1xdW90ZS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3NlbmQtcXVvdGVcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3NlbmQtcXVvdGUvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFx1MzI5NzAyXFxcXElkZWFQcm9qZWN0c1xcXFxzdGFja3F1b3Rlc1xcXFxhcHBcXFxcYXBpXFxcXHNlbmQtcXVvdGVcXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3NlbmQtcXVvdGUvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsend-quote%2Froute&page=%2Fapi%2Fsend-quote%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsend-quote%2Froute.ts&appDir=C%3A%5CUsers%5Cu329702%5CIdeaProjects%5Cstackquotes%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cu329702%5CIdeaProjects%5Cstackquotes&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/send-quote/route.ts":
/*!*************************************!*\
  !*** ./app/api/send-quote/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var resend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! resend */ \"(rsc)/./node_modules/resend/dist/index.mjs\");\n/* harmony import */ var pdfkit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! pdfkit */ \"(rsc)/./node_modules/pdfkit/js/pdfkit.es.js\");\n/* harmony import */ var get_stream__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! get-stream */ \"(rsc)/./node_modules/get-stream/source/index.js\");\n\n\n\n\nconst resend = new resend__WEBPACK_IMPORTED_MODULE_1__.Resend(process.env.RESEND_API_KEY);\nasync function POST(req) {\n    try {\n        const body = await req.json();\n        const { clientEmail, quote } = body;\n        if (!clientEmail || !quote) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Missing clientEmail or quote\"\n            }, {\n                status: 400\n            });\n        }\n        // Generate PDF\n        const doc = new pdfkit__WEBPACK_IMPORTED_MODULE_2__[\"default\"]();\n        doc.fontSize(18).text(\"Quote\", {\n            align: \"center\"\n        });\n        doc.moveDown();\n        doc.fontSize(12).text(`Project: ${quote.project_title}`);\n        doc.text(`Client: ${quote.client_name}`);\n        doc.text(`Email: ${quote.client_email}`);\n        doc.moveDown();\n        doc.text(\"Description:\");\n        doc.text(quote.project_description || \"N/A\");\n        doc.moveDown();\n        doc.text(`Good: $${quote.good_total}`);\n        doc.text(`Better: $${quote.better_total}`);\n        doc.text(`Best: $${quote.best_total}`);\n        doc.end();\n        const pdfBuffer = await get_stream__WEBPACK_IMPORTED_MODULE_3__[\"default\"].buffer(doc);\n        // Send email with Resend\n        const result = await resend.emails.send({\n            from: \"StackQuotes <noreply@stackquotes.com>\",\n            to: [\n                clientEmail\n            ],\n            subject: `Quote: ${quote.project_title}`,\n            html: \"<p>Please find your quote attached.</p>\",\n            attachments: [\n                {\n                    filename: \"quote.pdf\",\n                    content: pdfBuffer\n                }\n            ]\n        });\n        console.log(\"\\uD83D\\uDCE7 Resend result:\", JSON.stringify(result, null, 2));\n        if (result.error) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: result.error\n            }, {\n                status: 400\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            data: result.data\n        });\n    } catch (err) {\n        console.error(\"❌ Send quote error:\", err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: err.message,\n            stack: err.stack\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3NlbmQtcXVvdGUvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBMkM7QUFDWDtBQUNDO0FBQ0U7QUFFbkMsTUFBTUksU0FBUyxJQUFJSCwwQ0FBTUEsQ0FBQ0ksUUFBUUMsR0FBRyxDQUFDQyxjQUFjO0FBRTdDLGVBQWVDLEtBQUtDLEdBQVk7SUFDckMsSUFBSTtRQUNGLE1BQU1DLE9BQU8sTUFBTUQsSUFBSUUsSUFBSTtRQUMzQixNQUFNLEVBQUVDLFdBQVcsRUFBRUMsS0FBSyxFQUFFLEdBQUdIO1FBRS9CLElBQUksQ0FBQ0UsZUFBZSxDQUFDQyxPQUFPO1lBQzFCLE9BQU9iLHFEQUFZQSxDQUFDVyxJQUFJLENBQ3RCO2dCQUFFRyxPQUFPO1lBQStCLEdBQ3hDO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxlQUFlO1FBQ2YsTUFBTUMsTUFBTSxJQUFJZCw4Q0FBV0E7UUFDM0JjLElBQUlDLFFBQVEsQ0FBQyxJQUFJQyxJQUFJLENBQUMsU0FBUztZQUFFQyxPQUFPO1FBQVM7UUFDakRILElBQUlJLFFBQVE7UUFDWkosSUFBSUMsUUFBUSxDQUFDLElBQUlDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRUwsTUFBTVEsYUFBYSxDQUFDLENBQUM7UUFDdkRMLElBQUlFLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRUwsTUFBTVMsV0FBVyxDQUFDLENBQUM7UUFDdkNOLElBQUlFLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRUwsTUFBTVUsWUFBWSxDQUFDLENBQUM7UUFDdkNQLElBQUlJLFFBQVE7UUFDWkosSUFBSUUsSUFBSSxDQUFDO1FBQ1RGLElBQUlFLElBQUksQ0FBQ0wsTUFBTVcsbUJBQW1CLElBQUk7UUFDdENSLElBQUlJLFFBQVE7UUFDWkosSUFBSUUsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFTCxNQUFNWSxVQUFVLENBQUMsQ0FBQztRQUNyQ1QsSUFBSUUsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFTCxNQUFNYSxZQUFZLENBQUMsQ0FBQztRQUN6Q1YsSUFBSUUsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFTCxNQUFNYyxVQUFVLENBQUMsQ0FBQztRQUNyQ1gsSUFBSVksR0FBRztRQUVQLE1BQU1DLFlBQVksTUFBTTFCLGtEQUFTQSxDQUFDMkIsTUFBTSxDQUFDZDtRQUV6Qyx5QkFBeUI7UUFDekIsTUFBTWUsU0FBUyxNQUFNM0IsT0FBTzRCLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDO1lBQ3RDQyxNQUFNO1lBQ05DLElBQUk7Z0JBQUN2QjthQUFZO1lBQ2pCd0IsU0FBUyxDQUFDLE9BQU8sRUFBRXZCLE1BQU1RLGFBQWEsQ0FBQyxDQUFDO1lBQ3hDZ0IsTUFBTTtZQUNOQyxhQUFhO2dCQUNYO29CQUNFQyxVQUFVO29CQUNWQyxTQUFTWDtnQkFDWDthQUNEO1FBQ0g7UUFFQVksUUFBUUMsR0FBRyxDQUFDLCtCQUFxQkMsS0FBS0MsU0FBUyxDQUFDYixRQUFRLE1BQU07UUFFOUQsSUFBSUEsT0FBT2pCLEtBQUssRUFBRTtZQUNoQixPQUFPZCxxREFBWUEsQ0FBQ1csSUFBSSxDQUN0QjtnQkFBRWtDLFNBQVM7Z0JBQU8vQixPQUFPaUIsT0FBT2pCLEtBQUs7WUFBQyxHQUN0QztnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsT0FBT2YscURBQVlBLENBQUNXLElBQUksQ0FBQztZQUFFa0MsU0FBUztZQUFNQyxNQUFNZixPQUFPZSxJQUFJO1FBQUM7SUFDOUQsRUFBRSxPQUFPQyxLQUFVO1FBQ2pCTixRQUFRM0IsS0FBSyxDQUFDLHVCQUF1QmlDO1FBQ3JDLE9BQU8vQyxxREFBWUEsQ0FBQ1csSUFBSSxDQUN0QjtZQUFFa0MsU0FBUztZQUFPL0IsT0FBT2lDLElBQUlDLE9BQU87WUFBRUMsT0FBT0YsSUFBSUUsS0FBSztRQUFDLEdBQ3ZEO1lBQUVsQyxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL215LXYwLXByb2plY3QvLi9hcHAvYXBpL3NlbmQtcXVvdGUvcm91dGUudHM/ZTVlYyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgUmVzZW5kIH0gZnJvbSBcInJlc2VuZFwiO1xyXG5pbXBvcnQgUERGRG9jdW1lbnQgZnJvbSBcInBkZmtpdFwiO1xyXG5pbXBvcnQgZ2V0U3RyZWFtIGZyb20gXCJnZXQtc3RyZWFtXCI7XHJcblxyXG5jb25zdCByZXNlbmQgPSBuZXcgUmVzZW5kKHByb2Nlc3MuZW52LlJFU0VORF9BUElfS0VZISk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCk7XHJcbiAgICBjb25zdCB7IGNsaWVudEVtYWlsLCBxdW90ZSB9ID0gYm9keTtcclxuXHJcbiAgICBpZiAoIWNsaWVudEVtYWlsIHx8ICFxdW90ZSkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBlcnJvcjogXCJNaXNzaW5nIGNsaWVudEVtYWlsIG9yIHF1b3RlXCIgfSxcclxuICAgICAgICB7IHN0YXR1czogNDAwIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBQREZcclxuICAgIGNvbnN0IGRvYyA9IG5ldyBQREZEb2N1bWVudCgpO1xyXG4gICAgZG9jLmZvbnRTaXplKDE4KS50ZXh0KFwiUXVvdGVcIiwgeyBhbGlnbjogXCJjZW50ZXJcIiB9KTtcclxuICAgIGRvYy5tb3ZlRG93bigpO1xyXG4gICAgZG9jLmZvbnRTaXplKDEyKS50ZXh0KGBQcm9qZWN0OiAke3F1b3RlLnByb2plY3RfdGl0bGV9YCk7XHJcbiAgICBkb2MudGV4dChgQ2xpZW50OiAke3F1b3RlLmNsaWVudF9uYW1lfWApO1xyXG4gICAgZG9jLnRleHQoYEVtYWlsOiAke3F1b3RlLmNsaWVudF9lbWFpbH1gKTtcclxuICAgIGRvYy5tb3ZlRG93bigpO1xyXG4gICAgZG9jLnRleHQoXCJEZXNjcmlwdGlvbjpcIik7XHJcbiAgICBkb2MudGV4dChxdW90ZS5wcm9qZWN0X2Rlc2NyaXB0aW9uIHx8IFwiTi9BXCIpO1xyXG4gICAgZG9jLm1vdmVEb3duKCk7XHJcbiAgICBkb2MudGV4dChgR29vZDogJCR7cXVvdGUuZ29vZF90b3RhbH1gKTtcclxuICAgIGRvYy50ZXh0KGBCZXR0ZXI6ICQke3F1b3RlLmJldHRlcl90b3RhbH1gKTtcclxuICAgIGRvYy50ZXh0KGBCZXN0OiAkJHtxdW90ZS5iZXN0X3RvdGFsfWApO1xyXG4gICAgZG9jLmVuZCgpO1xyXG5cclxuICAgIGNvbnN0IHBkZkJ1ZmZlciA9IGF3YWl0IGdldFN0cmVhbS5idWZmZXIoZG9jKTtcclxuXHJcbiAgICAvLyBTZW5kIGVtYWlsIHdpdGggUmVzZW5kXHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNlbmQuZW1haWxzLnNlbmQoe1xyXG4gICAgICBmcm9tOiBcIlN0YWNrUXVvdGVzIDxub3JlcGx5QHN0YWNrcXVvdGVzLmNvbT5cIiwgLy8gbXVzdCBtYXRjaCB2ZXJpZmllZCBkb21haW5cclxuICAgICAgdG86IFtjbGllbnRFbWFpbF0sXHJcbiAgICAgIHN1YmplY3Q6IGBRdW90ZTogJHtxdW90ZS5wcm9qZWN0X3RpdGxlfWAsXHJcbiAgICAgIGh0bWw6IFwiPHA+UGxlYXNlIGZpbmQgeW91ciBxdW90ZSBhdHRhY2hlZC48L3A+XCIsXHJcbiAgICAgIGF0dGFjaG1lbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZmlsZW5hbWU6IFwicXVvdGUucGRmXCIsXHJcbiAgICAgICAgICBjb250ZW50OiBwZGZCdWZmZXIsIC8vIOKchSBzZW5kIGJ1ZmZlciBkaXJlY3RseVxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcIvCfk6cgUmVzZW5kIHJlc3VsdDpcIiwgSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKSk7XHJcblxyXG4gICAgaWYgKHJlc3VsdC5lcnJvcikge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHJlc3VsdC5lcnJvciB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiA0MDAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdC5kYXRhIH0pO1xyXG4gIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwi4p2MIFNlbmQgcXVvdGUgZXJyb3I6XCIsIGVycik7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSwgc3RhY2s6IGVyci5zdGFjayB9LFxyXG4gICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgICk7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJSZXNlbmQiLCJQREZEb2N1bWVudCIsImdldFN0cmVhbSIsInJlc2VuZCIsInByb2Nlc3MiLCJlbnYiLCJSRVNFTkRfQVBJX0tFWSIsIlBPU1QiLCJyZXEiLCJib2R5IiwianNvbiIsImNsaWVudEVtYWlsIiwicXVvdGUiLCJlcnJvciIsInN0YXR1cyIsImRvYyIsImZvbnRTaXplIiwidGV4dCIsImFsaWduIiwibW92ZURvd24iLCJwcm9qZWN0X3RpdGxlIiwiY2xpZW50X25hbWUiLCJjbGllbnRfZW1haWwiLCJwcm9qZWN0X2Rlc2NyaXB0aW9uIiwiZ29vZF90b3RhbCIsImJldHRlcl90b3RhbCIsImJlc3RfdG90YWwiLCJlbmQiLCJwZGZCdWZmZXIiLCJidWZmZXIiLCJyZXN1bHQiLCJlbWFpbHMiLCJzZW5kIiwiZnJvbSIsInRvIiwic3ViamVjdCIsImh0bWwiLCJhdHRhY2htZW50cyIsImZpbGVuYW1lIiwiY29udGVudCIsImNvbnNvbGUiLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5Iiwic3VjY2VzcyIsImRhdGEiLCJlcnIiLCJtZXNzYWdlIiwic3RhY2siXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/send-quote/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/crypto-js","vendor-chunks/restructure","vendor-chunks/brotli","vendor-chunks/math-intrinsics","vendor-chunks/get-stream","vendor-chunks/es-errors","vendor-chunks/call-bind-apply-helpers","vendor-chunks/regexp.prototype.flags","vendor-chunks/object.assign","vendor-chunks/object-is","vendor-chunks/object-keys","vendor-chunks/get-proto","vendor-chunks/fontkit","vendor-chunks/unicode-trie","vendor-chunks/object-inspect","vendor-chunks/linebreak","vendor-chunks/jpeg-exif","vendor-chunks/has-symbols","vendor-chunks/gopd","vendor-chunks/function-bind","vendor-chunks/call-bind","vendor-chunks/unicode-properties","vendor-chunks/resend","vendor-chunks/es-get-iterator","vendor-chunks/available-typed-arrays","vendor-chunks/which-typed-array","vendor-chunks/which-collection","vendor-chunks/which-boxed-primitive","vendor-chunks/tiny-inflate","vendor-chunks/side-channel","vendor-chunks/side-channel-weakmap","vendor-chunks/side-channel-map","vendor-chunks/side-channel-list","vendor-chunks/set-function-name","vendor-chunks/set-function-length","vendor-chunks/safe-regex-test","vendor-chunks/possible-typed-array-names","vendor-chunks/png-js","vendor-chunks/pdfkit","vendor-chunks/isarray","vendor-chunks/is-weakset","vendor-chunks/is-weakmap","vendor-chunks/is-symbol","vendor-chunks/is-string","vendor-chunks/is-shared-array-buffer","vendor-chunks/is-set","vendor-chunks/is-regex","vendor-chunks/is-number-object","vendor-chunks/is-map","vendor-chunks/is-date-object","vendor-chunks/is-callable","vendor-chunks/is-boolean-object","vendor-chunks/is-bigint","vendor-chunks/is-array-buffer","vendor-chunks/is-arguments","vendor-chunks/hasown","vendor-chunks/has-tostringtag","vendor-chunks/has-property-descriptors","vendor-chunks/has-bigints","vendor-chunks/get-intrinsic","vendor-chunks/functions-have-names","vendor-chunks/for-each","vendor-chunks/es-object-atoms","vendor-chunks/es-define-property","vendor-chunks/dunder-proto","vendor-chunks/dfa","vendor-chunks/define-properties","vendor-chunks/define-data-property","vendor-chunks/deep-equal","vendor-chunks/clone","vendor-chunks/call-bound","vendor-chunks/base64-js","vendor-chunks/array-buffer-byte-length"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsend-quote%2Froute&page=%2Fapi%2Fsend-quote%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsend-quote%2Froute.ts&appDir=C%3A%5CUsers%5Cu329702%5CIdeaProjects%5Cstackquotes%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cu329702%5CIdeaProjects%5Cstackquotes&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();