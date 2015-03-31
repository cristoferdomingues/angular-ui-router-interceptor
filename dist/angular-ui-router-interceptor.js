/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(/*! ./boot */ 2);


/***/ },
/* 1 */
/*!**************************!*\
  !*** external "angular" ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = angular;

/***/ },
/* 2 */
/*!*********************!*\
  !*** ./src/boot.js ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var stateInterceptorModule = __webpack_require__(/*! ./stateInterceptorModule */ 5),
	    stateInterceptorConfig = __webpack_require__(/*! ./stateInterceptorConfig */ 3),
	    stateInterceptorService = __webpack_require__(/*! ./stateInterceptorService */ 7),
	    stateInterceptorRunner = __webpack_require__(/*! ./stateInterceptorRunner */ 6);
	
	stateInterceptorModule
	    .config(stateInterceptorConfig)
	    .service('stateInterceptor', stateInterceptorService)
	    .run(stateInterceptorRunner);
	
	module.exports = stateInterceptorModule;


/***/ },
/* 3 */
/*!***************************************!*\
  !*** ./src/stateInterceptorConfig.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var StateInterceptorDecorator = __webpack_require__(/*! ./stateInterceptorDecorator */ 4);
	
	function StateInterceptorConfig($provide) {
	    $provide.decorator('$state', StateInterceptorDecorator);
	}
	
	StateInterceptorConfig.$inject = [
	    '$provide'
	];
	
	module.exports = StateInterceptorConfig;


/***/ },
/* 4 */
/*!******************************************!*\
  !*** ./src/stateInterceptorDecorator.js ***!
  \******************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var angular = __webpack_require__(/*! angular */ 1);
	
	var copy = angular.copy,
	    extend = angular.extend;
	
	function StateInterceptorDecorator($delegate, $stateParams, stateInterceptor) {
	    var transitionTo = $delegate.transitionTo;
	
	    $delegate.transitionTo = function (to, toParams, options) {
	        var stateParams = extend({}, copy($delegate.params), copy($stateParams), copy(toParams)),
	            state = $delegate.get(to, toParams);
	
	        return stateInterceptor.intercept(state, stateParams).then(function (interceptions) {
	            if (state) {
	                state.$interceptions = interceptions;
	            }
	
	            return transitionTo(to, toParams, options);
	        });
	    };
	
	    return $delegate;
	}
	
	StateInterceptorDecorator.$inject = [
	    '$delegate',
	    '$stateParams',
	    'stateInterceptor'
	];
	
	module.exports = StateInterceptorDecorator;


/***/ },
/* 5 */
/*!***************************************!*\
  !*** ./src/stateInterceptorModule.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var angular = __webpack_require__(/*! angular */ 1);
	
	module.exports = angular.module('ui.router.interceptor', ['ui.router']);


/***/ },
/* 6 */
/*!***************************************!*\
  !*** ./src/stateInterceptorRunner.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var angular = __webpack_require__(/*! angular */ 1);
	
	var isObject = angular.isObject;
	
	function StateInterceptorRunner($rootScope, $state) {
	    $rootScope.$on('$stateChangeStart', function(event, toState) {
	        var interceptions = toState.$interceptions || [],
	            interception = interceptions.find(isObject);
	
	        if (interception) {
	            event.preventDefault();
	
	            $state.go(interception.state, interception.params, interception.options);
	
	            delete toState.$interceptions;
	        }
	    });
	}
	
	StateInterceptorRunner.$inject = [
	    '$rootScope',
	    '$state'
	];
	
	module.exports = StateInterceptorRunner;


/***/ },
/* 7 */
/*!****************************************!*\
  !*** ./src/stateInterceptorService.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var angular = __webpack_require__(/*! angular */ 1);
	
	var isFunction = angular.isFunction,
	    isString = angular.isString;
	
	function StateInterceptorService($q, $injector, $cacheFactory) {
	    var cache = $cacheFactory('$stateInterceptors');
	
	    function resolveInterceptor(name) {
	        var interceptor = function (result) { return result; };
	
	        interceptor.$inject = [name];
	
	        return $injector.invoke(interceptor);
	    }
	
	    function getInterceptor(name) {
	        var interceptor = cache.get(name);
	
	        if (!interceptor) {
	            interceptor = resolveInterceptor(name);
	
	            cache.put(name, interceptor);
	        }
	
	        return interceptor;
	    }
	
	    function getInterceptors(state) {
	        var data = (state && state.data) || {},
	            interceptors = data.interceptors || [];
	
	        return interceptors.map(function(interceptor) {
	            return isString(interceptor) ? getInterceptor(interceptor) : interceptor;
	        }).filter(function(interceptor) {
	            return interceptor && isFunction(interceptor.intercept);
	        });
	    }
	
	    function interceptAll(state, params, options) {
	        return getInterceptors(state).map(function(interceptor) {
	            return interceptor.intercept(state, params, options);
	        });
	    }
	
	    return {
	        intercept: function(state, params, options) {
	            return $q.all(interceptAll(state, params, options));
	        }
	    };
	}
	
	StateInterceptorService.$inject = [
	    '$q',
	    '$injector',
	    '$cacheFactory'
	];
	
	module.exports = StateInterceptorService;


/***/ }
/******/ ]);
//# sourceMappingURL=angular-ui-router-interceptor.js.map