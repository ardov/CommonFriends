(function(window) {
    'use strict';

    // Event constructor
    window.Event = function () {
        this._observers = [];
    };
    Event.prototype = {
        raise: function(data) {
            this._observers.forEach(function(el) {
                el.observer.call(el.context, data);
            });
        },

        subscribe: function(observer, context) {
            var ctx = context || null;
            this._observers.push({
                observer: observer,
                context: ctx
            });
        },

        unsubscribe: function(observer, context) {
            this._observers.forEach(function(el, i, arr) {
                if (el.observer == observer && el.context == context) {
                    delete arr[i];
                }
            });
        }
    };

    // addEventListener wrapper:
    window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

    // Get element(s) by CSS selector:
    window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};

    window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

    function getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    window.accessToken = getParameterByName('access_token');

    window.testMode = 1;

    // Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;

})(window);
