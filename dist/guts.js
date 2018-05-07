var Guts = (function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  function initComponents(Component) {
    Component.prototype.initComponents = function () {
      var _this = this;

      var initComponent = function initComponent(element) {
        if (!element.dataset.component) {
          return traverseDom([].concat(toConsumableArray(element.children)));
        }

        var componentName = element.dataset.component;
        var Component = _this.components[componentName];

        if (Component) {
          Component.prototype.components = _this.components;
          var component = new Component(element, _this);
          component.initialize();
          component.initComponents();
          component.bindEvents();
          _this.children.push(component);
        } else {
          throw new Error("Component " + componentName + " is not registered");
        }
      };

      var traverseDom = function traverseDom(elements) {
        elements.forEach(function (element) {
          initComponent(element);
        });
      };

      var children = [].concat(toConsumableArray(this.element.children));

      traverseDom(children);
    };
  }
  function initEvents(Component) {
    Component.prototype.on = function (eventName, cb) {

      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }

      var event = this.events[eventName];

      event.push(cb);
    };

    Component.prototype.once = function (eventName, cb) {
      var _this2 = this;

      var onceFunction = function onceFunction() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this2.off(eventName, onceFunction);
        cb.apply(null, args);
      };

      this.on(eventName, onceFunction);
    };

    Component.prototype.emit = function (eventName) {
      var context = this;

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      do {
        if (context.events[eventName]) {
          var events = context.events[eventName];
          for (var i = 0; i < events.length; i++) {
            events[i].apply(null, args);
          }
        }

        context = context.parent;
      } while (context);
    };

    Component.prototype.off = function (eventName, cb) {
      var namedEvent = this.events[eventName];

      if (!namedEvent) {
        return;
      }

      var eventIndex = namedEvent.indexOf(cb);

      if (eventIndex !== -1) {
        namedEvent.splice(eventIndex, 1);
      }
    };

    Component.prototype.broadcast = function (eventName) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      var children = this.children;

      if (children.length === 0) {
        return;
      }

      var eventArguments = [].concat(Array.prototype.slice.call(arguments));

      children.forEach(function (child) {
        if (child.events[eventName]) {
          var events = child.events[eventName];
          for (var i = 0; i < events.length; i++) {
            events[i].apply(null, args);
          }
        }

        child.broadcast.apply(child, eventArguments);
      });
    };
  }
  function addComponents(Component, components) {
    Component.prototype.components = components;
  }

  var Component = function () {
    function Component(element) {
      var _this = this;

      var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      classCallCheck(this, Component);

      this.element = this.ensureElement_(element);
      this.options = this.collectOptions_();
      this.events = {};
      this.children = [];
      this.parent = parent;
      this.on('hook:initialized', function () {
        _this.initialized();
      });
    }

    createClass(Component, [{
      key: 'bindEvents',
      value: function bindEvents() {
        var events = this.events;

        if (!events) {
          return;
        }

        for (var key in events) {
          if (events.hasOwnProperty(key)) {
            var method = events[key];

            if (!(typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'function') {
              method = this[method];
            }

            if (!method) {
              continue;
            }

            var match = key.match(Regex.EVENT_SPLITTER);

            this.bindEvent(match[1], match[2], method);
          }
        }

        return this;
      }
    }, {
      key: 'bindEvent',
      value: function bindEvent(event, query, method) {
        if (!query || !query.length) {
          this.element.addEventListener(event, method, false);

          return this;
        }

        [].concat(toConsumableArray(this.element.querySelectorAll(query))).map(function (el) {
          el.addEventListener(event, method, false);
        });

        return this;
      }
    }, {
      key: 'unbindEvents',
      value: function unbindEvents() {
        var events = this.events;

        if (!events) {
          return;
        }

        for (var key in events) {
          if (events.hasOwnProperty(key)) {
            var method = events[key];

            if (!(typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'function') {
              method = this[method];
            }

            if (!method) {
              continue;
            }

            var match = key.match(Regex.EVENT_SPLITTER);

            this.unbindEvent(match[1], match[2], method);
          }
        }

        return this;
      }
    }, {
      key: 'unbindEvent',
      value: function unbindEvent(event, query, method) {
        if (!query || !query.length) {
          this.element.removeEventListener(event, method, false);

          return this;
        }

        [].concat(toConsumableArray(this.element.querySelectorAll(query))).map(function (el) {
          el.removeEventListener(event, method, false);
        });

        return this;
      }
    }, {
      key: 'ensureElement_',
      value: function ensureElement_(element) {
        if (!element || !(element instanceof Element)) {
          throw new Error('Component should be initialized on an element');
        }

        return element;
      }
    }, {
      key: 'collectOptions_',
      value: function collectOptions_() {
        var _this2 = this;

        var options = {};
        var attributes = [].concat(toConsumableArray(this.element.attributes)).filter(function (attr) {
          return Regex.DATA_ATTR_NAME.test(attr.name) && attr.name !== 'data-component';
        }).forEach(function (attr) {
          options[Regex.DATA_ATTR_NAME.exec(attr.name)[1]] = _this2.parseOptions_(attr.value);
        });

        return options;
      }
    }, {
      key: 'parseOptions_',
      value: function parseOptions_(value) {
        var newVal = void 0;

        try {
          newVal = JSON.parse(value);

          if (Object.prototype.toString.call(newVal) === '[object Object]') {
            return newVal;
          }
        } catch (e) {}

        if (Object.prototype.toString.call(value) === '[object String]' && value.length === 0) {
          return value === '';
        }

        if (!isNaN(value)) {
          return parseInt(value);
        }

        return value;
      }
    }, {
      key: 'initialize',
      value: function initialize() {}
    }, {
      key: 'initialized',
      value: function initialized() {}
    }]);
    return Component;
  }();

  initComponents(Component);
  initEvents(Component);

  /**
   * Group of regex used by the base component.
   * @enum {RegExp}
   */
  var Regex = {
    EVENT_SPLITTER: /^(\S+)\s*(.*)$/,
    DATA_ATTR_NAME: /^data\-([a-z\d\-]+)$/
  };

  var Guts = function () {
    function Guts(el) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$events = _ref.events,
          events = _ref$events === undefined ? {} : _ref$events;

      classCallCheck(this, Guts);

      this.element = this.ensureElement_(el);
      this.components = Guts.components;
      this.events = events;
      this.children = [];

      this.initComponents();
      this.broadcast('hook:initialized');
    }

    createClass(Guts, [{
      key: 'ensureElement_',
      value: function ensureElement_(el) {
        if (!el) {
          throw new Error('You need DOM element to initialize');
        }

        var DOMElement = document.querySelector(el);
        if (!DOMElement) {
          throw new Error('Element not found in document');
        }

        return DOMElement;
      }
    }]);
    return Guts;
  }();

  initComponents(Guts);
  initEvents(Guts);
  addComponents(Guts, Guts.components);

  Guts.Component = Component;
  Guts.components = Object.create(null);
  Guts.component = function (id, component) {
    if (!component) {
      return;
    }

    this.components[id] = component;
  };

  return Guts;

}());
