/*!
 * Guts
 * (c) 2018 Jhonnatan Gonzalez <jhonnatanhxc@gmail.com>
 * https://github.com/xtatanx/guts
 *
 * Licensed under the MIT license.
 */
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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

  /**
   * Initialize component mixin for Guts and Guts.Component.
   * @param  {Guts|Component} Component Component to mix.
   */
  function initComponents(Component) {
    /**
     * Traverse DOM looking for child components and initialize them.
     */
    Component.prototype.initComponents = function () {
      var _this = this;

      /**
       * Initialize a component or if the element is not a component recursively check
       * for children elements to initialize.
       * @param  {Element} element DOM element.
       */
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
  /**
   * Initialize the events mixin.
   * @param  {Guts|Component} Component Component to mix.
   */
  function initEvents(Component) {

    /**
     * Listen to an event.
     * @param  {string} eventName Name of the event to start listening to.
     * @param  {function} cb Function to execute when triggered.
     */
    Component.prototype.on = function (eventName, cb) {

      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }

      var event = this.events[eventName];

      event.push(cb);
    };

    /**
     * Listen to an event once.
     * @param  {string} eventName Name of the event to start listening to.
     * @param  {function} cb Function to execute when triggered.
     */
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

    /**
     * Emit an event on self and all the way up to the chain of components until
     *   reaching root(Guts instance).
     * @param  {string} eventName Name of the event to emit.
     * @param  {*} args Any arguments we want to pass to the callback.
     */
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

    /**
     * Stop listening on an event.
     * @param  {string} eventName Name of the event to start listening to.
     * @param  {function} cb Function that was attached to the listener.
     */
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

    /**
     * Broadcast an event all the way down into the chain of components.
     * @param  {string} eventName Name of the event to broadcast.
     * @param  {*} args Any argument we want to pass to callback.
     */
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
  /**
   * Add components mixin. Every instance has a COImponents property it can use
   * to instantiate them..
   * @param {Guts|Component} Component Instance to add component.
   * @param {array[Component]} components Array of components registered by the
   *   user.
   */
  function addComponents(Component, components) {
    Component.prototype.components = components;
  }

  /**
   * Guts Component.
   */

  var Component = function () {
    /**
     * Creates a Guts component.
     * @param  {Element} element Dom element to be transformed into component.
     * @param  {Guts|Component} parent Guts instance if root  or a component
     *   instance if child component.
     */
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

    /**
     * Bind multiple events found in the events property.
     * @return {Component} For chaining purposes.
     */


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

      /**
       * Bind a single event.
       * @param  {string} event Event name
       * @param  {string} query Element query selector.
       * @param  {function} method Function to execute when event is fired.
       * @return {Component} For chaining purposes.
       */

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

      /**
       * Unbind all the events found in the events property.
       * @return {Component} For chaining purposes.
       */

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

      /**
       * Unbind a single event.
       * @param  {string} event Event name
       * @param  {string} query Element query selector.
       * @param  {function} method Function to execute when event is fired.
       * @return {Component} For chaining purposes.
       */

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

      /**
       * Make sure we passed an element.
       * @param  {Element} element DOM element.
       * @return {Element} If is instance of Element.
       * @private
       */

    }, {
      key: 'ensureElement_',
      value: function ensureElement_(element) {
        if (!element || !(element instanceof Element)) {
          throw new Error('Component should be initialized on an element');
        }

        return element;
      }

      /**
       * Collect options from data attributes.
       * @return {Object} Options object collected.
       * @private
       */

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

      /**
       * Parse data attributes as options
       * @param  {string|object|number} Values that we will try to parse.
       * @return {string|object|number|boolean} Parsed value.
       * @private
       * @example
       * <div data-auto-play></div> Treated as boolean returns: True
       * <div data-label="Correct"></div> treated as string returns: "Correct"
       * <div data-opts='{"foo": "bar"}'></div> Treated as an object returns:
       *   { foo: "bar"}
       * <div data-delay="2"></div> Treated as a number returns: 2
       */

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

      /**
       * Can perform DOm transformations and bind events before the component is
       *   initialized.
       */

    }, {
      key: 'initialize',
      value: function initialize() {}

      /**
       * Triggered once child components are initialized.
       */

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

  /**
   * Guts.
   */

  var Guts = function () {
    /**
     * Creates a Guts instance.
     * @param  {Element} el DOM element.
     * @param  {Object.<string, function>} events List of events this instance can
     *   listen/trigger.
     */
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

    /**
     * Make sure a DOM element is present in document.
     * @param  {Element} el DOM element.
     * @return {Element} Dom element if present in document.
     * @private
     */


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3V0cy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL21peGlucy5qcyIsIi4uL3NyYy9HdXRzQ29tcG9uZW50LmpzIiwiLi4vc3JjL0d1dHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBJbml0aWFsaXplIGNvbXBvbmVudCBtaXhpbiBmb3IgR3V0cyBhbmQgR3V0cy5Db21wb25lbnQuXG4gKiBAcGFyYW0gIHtHdXRzfENvbXBvbmVudH0gQ29tcG9uZW50IENvbXBvbmVudCB0byBtaXguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0Q29tcG9uZW50cyhDb21wb25lbnQpIHtcbiAgLyoqXG4gICAqIFRyYXZlcnNlIERPTSBsb29raW5nIGZvciBjaGlsZCBjb21wb25lbnRzIGFuZCBpbml0aWFsaXplIHRoZW0uXG4gICAqL1xuICBDb21wb25lbnQucHJvdG90eXBlLmluaXRDb21wb25lbnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGEgY29tcG9uZW50IG9yIGlmIHRoZSBlbGVtZW50IGlzIG5vdCBhIGNvbXBvbmVudCByZWN1cnNpdmVseSBjaGVja1xuICAgICAqIGZvciBjaGlsZHJlbiBlbGVtZW50cyB0byBpbml0aWFsaXplLlxuICAgICAqIEBwYXJhbSAge0VsZW1lbnR9IGVsZW1lbnQgRE9NIGVsZW1lbnQuXG4gICAgICovXG4gICAgY29uc3QgaW5pdENvbXBvbmVudCA9IChlbGVtZW50KSA9PiB7XG4gICAgICBpZiAoIWVsZW1lbnQuZGF0YXNldC5jb21wb25lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRyYXZlcnNlRG9tKFsuLi5lbGVtZW50LmNoaWxkcmVuXSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbXBvbmVudE5hbWUgPSBlbGVtZW50LmRhdGFzZXQuY29tcG9uZW50O1xuICAgICAgY29uc3QgQ29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdO1xuXG4gICAgICBpZiAoQ29tcG9uZW50KSB7XG4gICAgICAgIENvbXBvbmVudC5wcm90b3R5cGUuY29tcG9uZW50cyA9IHRoaXMuY29tcG9uZW50cztcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gbmV3IENvbXBvbmVudChlbGVtZW50LCB0aGlzKTtcbiAgICAgICAgY29tcG9uZW50LmluaXRpYWxpemUoKTtcbiAgICAgICAgY29tcG9uZW50LmluaXRDb21wb25lbnRzKCk7XG4gICAgICAgIGNvbXBvbmVudC5iaW5kRXZlbnRzKCk7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjb21wb25lbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21wb25lbnQgJHtjb21wb25lbnROYW1lfSBpcyBub3QgcmVnaXN0ZXJlZGApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRyYXZlcnNlRG9tID0gKGVsZW1lbnRzKSA9PiB7XG4gICAgICBlbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICAgIGluaXRDb21wb25lbnQoZWxlbWVudCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IFsuLi50aGlzLmVsZW1lbnQuY2hpbGRyZW5dO1xuXG4gICAgdHJhdmVyc2VEb20oY2hpbGRyZW4pO1xuICB9O1xufTtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGV2ZW50cyBtaXhpbi5cbiAqIEBwYXJhbSAge0d1dHN8Q29tcG9uZW50fSBDb21wb25lbnQgQ29tcG9uZW50IHRvIG1peC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRFdmVudHMoQ29tcG9uZW50KSB7XG5cbiAgLyoqXG4gICAqIExpc3RlbiB0byBhbiBldmVudC5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBldmVudE5hbWUgTmFtZSBvZiB0aGUgZXZlbnQgdG8gc3RhcnQgbGlzdGVuaW5nIHRvLlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gY2IgRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRyaWdnZXJlZC5cbiAgICovXG4gIENvbXBvbmVudC5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudE5hbWUsIGNiKSB7XG5cbiAgICBpZiAoIXRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBldmVudCA9IHRoaXMuZXZlbnRzW2V2ZW50TmFtZV07XG5cbiAgICBldmVudC5wdXNoKGNiKTtcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBMaXN0ZW4gdG8gYW4gZXZlbnQgb25jZS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBldmVudE5hbWUgTmFtZSBvZiB0aGUgZXZlbnQgdG8gc3RhcnQgbGlzdGVuaW5nIHRvLlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gY2IgRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRyaWdnZXJlZC5cbiAgICovXG4gIENvbXBvbmVudC5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2IpIHtcbiAgICBjb25zdCBvbmNlRnVuY3Rpb24gPSAoLi4uYXJncykgPT4ge1xuICAgICAgdGhpcy5vZmYoZXZlbnROYW1lLCBvbmNlRnVuY3Rpb24pO1xuICAgICAgY2IuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfTtcblxuICAgIHRoaXMub24oZXZlbnROYW1lLCBvbmNlRnVuY3Rpb24pO1xuICB9O1xuXG5cbiAgLyoqXG4gICAqIEVtaXQgYW4gZXZlbnQgb24gc2VsZiBhbmQgYWxsIHRoZSB3YXkgdXAgdG8gdGhlIGNoYWluIG9mIGNvbXBvbmVudHMgdW50aWxcbiAgICogICByZWFjaGluZyByb290KEd1dHMgaW5zdGFuY2UpLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGV2ZW50TmFtZSBOYW1lIG9mIHRoZSBldmVudCB0byBlbWl0LlxuICAgKiBAcGFyYW0gIHsqfSBhcmdzIEFueSBhcmd1bWVudHMgd2Ugd2FudCB0byBwYXNzIHRvIHRoZSBjYWxsYmFjay5cbiAgICovXG4gIENvbXBvbmVudC5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgLi4uYXJncykge1xuICAgIGxldCBjb250ZXh0ID0gdGhpcztcblxuICAgIGRvIHtcbiAgICAgIGlmIChjb250ZXh0LmV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICAgIGxldCBldmVudHMgPSBjb250ZXh0LmV2ZW50c1tldmVudE5hbWVdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBldmVudHNbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29udGV4dCA9IGNvbnRleHQucGFyZW50O1xuXG4gICAgfSB3aGlsZShjb250ZXh0KTtcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBTdG9wIGxpc3RlbmluZyBvbiBhbiBldmVudC5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBldmVudE5hbWUgTmFtZSBvZiB0aGUgZXZlbnQgdG8gc3RhcnQgbGlzdGVuaW5nIHRvLlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gY2IgRnVuY3Rpb24gdGhhdCB3YXMgYXR0YWNoZWQgdG8gdGhlIGxpc3RlbmVyLlxuICAgKi9cbiAgQ29tcG9uZW50LnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbihldmVudE5hbWUsIGNiKSB7XG4gICAgY29uc3QgbmFtZWRFdmVudCA9IHRoaXMuZXZlbnRzW2V2ZW50TmFtZV07XG5cbiAgICBpZighbmFtZWRFdmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGV2ZW50SW5kZXggPSBuYW1lZEV2ZW50LmluZGV4T2YoY2IpO1xuXG4gICAgaWYoZXZlbnRJbmRleCAhPT0gLTEpIHtcbiAgICAgIG5hbWVkRXZlbnQuc3BsaWNlKGV2ZW50SW5kZXgsIDEpO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBCcm9hZGNhc3QgYW4gZXZlbnQgYWxsIHRoZSB3YXkgZG93biBpbnRvIHRoZSBjaGFpbiBvZiBjb21wb25lbnRzLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGV2ZW50TmFtZSBOYW1lIG9mIHRoZSBldmVudCB0byBicm9hZGNhc3QuXG4gICAqIEBwYXJhbSAgeyp9IGFyZ3MgQW55IGFyZ3VtZW50IHdlIHdhbnQgdG8gcGFzcyB0byBjYWxsYmFjay5cbiAgICovXG4gIENvbXBvbmVudC5wcm90b3R5cGUuYnJvYWRjYXN0ID0gZnVuY3Rpb24oZXZlbnROYW1lLCAuLi5hcmdzKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuO1xuXG4gICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGV2ZW50QXJndW1lbnRzID0gWy4uLmFyZ3VtZW50c107XG5cbiAgICBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICBpZiAoY2hpbGQuZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgbGV0IGV2ZW50cyA9IGNoaWxkLmV2ZW50c1tldmVudE5hbWVdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBldmVudHNbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2hpbGQuYnJvYWRjYXN0LmFwcGx5KGNoaWxkLCBldmVudEFyZ3VtZW50cyk7XG4gICAgfSk7XG4gIH07XG59O1xuXG5cbi8qKlxuICogQWRkIGNvbXBvbmVudHMgbWl4aW4uIEV2ZXJ5IGluc3RhbmNlIGhhcyBhIENPSW1wb25lbnRzIHByb3BlcnR5IGl0IGNhbiB1c2VcbiAqIHRvIGluc3RhbnRpYXRlIHRoZW0uLlxuICogQHBhcmFtIHtHdXRzfENvbXBvbmVudH0gQ29tcG9uZW50IEluc3RhbmNlIHRvIGFkZCBjb21wb25lbnQuXG4gKiBAcGFyYW0ge2FycmF5W0NvbXBvbmVudF19IGNvbXBvbmVudHMgQXJyYXkgb2YgY29tcG9uZW50cyByZWdpc3RlcmVkIGJ5IHRoZVxuICogICB1c2VyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkQ29tcG9uZW50cyhDb21wb25lbnQsIGNvbXBvbmVudHMpIHtcbiAgQ29tcG9uZW50LnByb3RvdHlwZS5jb21wb25lbnRzID0gY29tcG9uZW50cztcbn07XG4iLCJpbXBvcnQgeyBpbml0Q29tcG9uZW50cywgaW5pdEV2ZW50c30gZnJvbSAnLi9taXhpbnMnO1xuXG4vKipcbiAqIEd1dHMgQ29tcG9uZW50LlxuICovXG5jbGFzcyBDb21wb25lbnQge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIEd1dHMgY29tcG9uZW50LlxuICAgKiBAcGFyYW0gIHtFbGVtZW50fSBlbGVtZW50IERvbSBlbGVtZW50IHRvIGJlIHRyYW5zZm9ybWVkIGludG8gY29tcG9uZW50LlxuICAgKiBAcGFyYW0gIHtHdXRzfENvbXBvbmVudH0gcGFyZW50IEd1dHMgaW5zdGFuY2UgaWYgcm9vdCAgb3IgYSBjb21wb25lbnRcbiAgICogICBpbnN0YW5jZSBpZiBjaGlsZCBjb21wb25lbnQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBwYXJlbnQ9bnVsbCkge1xuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuZW5zdXJlRWxlbWVudF8oZWxlbWVudCk7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5jb2xsZWN0T3B0aW9uc18oKTtcbiAgICB0aGlzLmV2ZW50cyA9IHt9O1xuICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9uKCdob29rOmluaXRpYWxpemVkJywgKCkgPT4ge1xuICAgICAgdGhpcy5pbml0aWFsaXplZCgpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQmluZCBtdWx0aXBsZSBldmVudHMgZm91bmQgaW4gdGhlIGV2ZW50cyBwcm9wZXJ0eS5cbiAgICogQHJldHVybiB7Q29tcG9uZW50fSBGb3IgY2hhaW5pbmcgcHVycG9zZXMuXG4gICAqL1xuICBiaW5kRXZlbnRzKCkge1xuICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuZXZlbnRzO1xuXG4gICAgaWYgKCFldmVudHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBrZXkgaW4gZXZlbnRzKSB7XG4gICAgICBpZiAoZXZlbnRzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9IGV2ZW50c1trZXldO1xuXG4gICAgICAgIGlmICghdHlwZW9mIG1ldGhvZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG1ldGhvZCA9IHRoaXNbbWV0aG9kXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbWV0aG9kKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWF0Y2ggPSBrZXkubWF0Y2goUmVnZXguRVZFTlRfU1BMSVRURVIpO1xuXG4gICAgICAgIHRoaXMuYmluZEV2ZW50KG1hdGNoWzFdLCBtYXRjaFsyXSwgbWV0aG9kKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEJpbmQgYSBzaW5nbGUgZXZlbnQuXG4gICAqIEBwYXJhbSAge3N0cmluZ30gZXZlbnQgRXZlbnQgbmFtZVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHF1ZXJ5IEVsZW1lbnQgcXVlcnkgc2VsZWN0b3IuXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBtZXRob2QgRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGV2ZW50IGlzIGZpcmVkLlxuICAgKiBAcmV0dXJuIHtDb21wb25lbnR9IEZvciBjaGFpbmluZyBwdXJwb3Nlcy5cbiAgICovXG4gIGJpbmRFdmVudChldmVudCwgcXVlcnksIG1ldGhvZCkge1xuICAgIGlmICghcXVlcnkgfHwgIXF1ZXJ5Lmxlbmd0aCkge1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG1ldGhvZCwgZmFsc2UpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBbLi4udGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwocXVlcnkpXS5tYXAoKGVsKSA9PiB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBtZXRob2QsIGZhbHNlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICAvKipcbiAgICogVW5iaW5kIGFsbCB0aGUgZXZlbnRzIGZvdW5kIGluIHRoZSBldmVudHMgcHJvcGVydHkuXG4gICAqIEByZXR1cm4ge0NvbXBvbmVudH0gRm9yIGNoYWluaW5nIHB1cnBvc2VzLlxuICAgKi9cbiAgdW5iaW5kRXZlbnRzKCkge1xuICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuZXZlbnRzO1xuXG4gICAgaWYgKCFldmVudHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBrZXkgaW4gZXZlbnRzKSB7XG4gICAgICBpZiAoZXZlbnRzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgbGV0IG1ldGhvZCA9IGV2ZW50c1trZXldO1xuXG4gICAgICAgIGlmICghdHlwZW9mIG1ldGhvZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIG1ldGhvZCA9IHRoaXNbbWV0aG9kXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbWV0aG9kKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWF0Y2ggPSBrZXkubWF0Y2goUmVnZXguRVZFTlRfU1BMSVRURVIpO1xuXG4gICAgICAgIHRoaXMudW5iaW5kRXZlbnQobWF0Y2hbMV0sIG1hdGNoWzJdLCBtZXRob2QpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICAvKipcbiAgICogVW5iaW5kIGEgc2luZ2xlIGV2ZW50LlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGV2ZW50IEV2ZW50IG5hbWVcbiAgICogQHBhcmFtICB7c3RyaW5nfSBxdWVyeSBFbGVtZW50IHF1ZXJ5IHNlbGVjdG9yLlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gbWV0aG9kIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBldmVudCBpcyBmaXJlZC5cbiAgICogQHJldHVybiB7Q29tcG9uZW50fSBGb3IgY2hhaW5pbmcgcHVycG9zZXMuXG4gICAqL1xuICB1bmJpbmRFdmVudChldmVudCwgcXVlcnksIG1ldGhvZCkge1xuICAgIGlmICghcXVlcnkgfHwgIXF1ZXJ5Lmxlbmd0aCkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG1ldGhvZCwgZmFsc2UpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBbLi4udGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwocXVlcnkpXS5tYXAoKGVsKSA9PiB7XG4gICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBtZXRob2QsIGZhbHNlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cblxuICAvKipcbiAgICogTWFrZSBzdXJlIHdlIHBhc3NlZCBhbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHtFbGVtZW50fSBlbGVtZW50IERPTSBlbGVtZW50LlxuICAgKiBAcmV0dXJuIHtFbGVtZW50fSBJZiBpcyBpbnN0YW5jZSBvZiBFbGVtZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZW5zdXJlRWxlbWVudF8oZWxlbWVudCkge1xuICAgIGlmICghZWxlbWVudCB8fCAhKGVsZW1lbnQgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgc2hvdWxkIGJlIGluaXRpYWxpemVkIG9uIGFuIGVsZW1lbnQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbGxlY3Qgb3B0aW9ucyBmcm9tIGRhdGEgYXR0cmlidXRlcy5cbiAgICogQHJldHVybiB7T2JqZWN0fSBPcHRpb25zIG9iamVjdCBjb2xsZWN0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjb2xsZWN0T3B0aW9uc18oKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBbLi4udGhpcy5lbGVtZW50LmF0dHJpYnV0ZXNdXG4gICAgLmZpbHRlcigoYXR0cikgPT4ge1xuICAgICAgcmV0dXJuIFJlZ2V4LkRBVEFfQVRUUl9OQU1FLnRlc3QoYXR0ci5uYW1lKSAmJlxuICAgICAgICBhdHRyLm5hbWUgIT09ICdkYXRhLWNvbXBvbmVudCc7XG4gICAgfSlcbiAgICAuZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgICAgb3B0aW9uc1tSZWdleC5EQVRBX0FUVFJfTkFNRS5leGVjKGF0dHIubmFtZSlbMV1dID1cbiAgICAgICAgdGhpcy5wYXJzZU9wdGlvbnNfKGF0dHIudmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBQYXJzZSBkYXRhIGF0dHJpYnV0ZXMgYXMgb3B0aW9uc1xuICAgKiBAcGFyYW0gIHtzdHJpbmd8b2JqZWN0fG51bWJlcn0gVmFsdWVzIHRoYXQgd2Ugd2lsbCB0cnkgdG8gcGFyc2UuXG4gICAqIEByZXR1cm4ge3N0cmluZ3xvYmplY3R8bnVtYmVyfGJvb2xlYW59IFBhcnNlZCB2YWx1ZS5cbiAgICogQHByaXZhdGVcbiAgICogQGV4YW1wbGVcbiAgICogPGRpdiBkYXRhLWF1dG8tcGxheT48L2Rpdj4gVHJlYXRlZCBhcyBib29sZWFuIHJldHVybnM6IFRydWVcbiAgICogPGRpdiBkYXRhLWxhYmVsPVwiQ29ycmVjdFwiPjwvZGl2PiB0cmVhdGVkIGFzIHN0cmluZyByZXR1cm5zOiBcIkNvcnJlY3RcIlxuICAgKiA8ZGl2IGRhdGEtb3B0cz0ne1wiZm9vXCI6IFwiYmFyXCJ9Jz48L2Rpdj4gVHJlYXRlZCBhcyBhbiBvYmplY3QgcmV0dXJuczpcbiAgICogICB7IGZvbzogXCJiYXJcIn1cbiAgICogPGRpdiBkYXRhLWRlbGF5PVwiMlwiPjwvZGl2PiBUcmVhdGVkIGFzIGEgbnVtYmVyIHJldHVybnM6IDJcbiAgICovXG4gIHBhcnNlT3B0aW9uc18odmFsdWUpIHtcbiAgICBsZXQgbmV3VmFsO1xuXG4gICAgdHJ5IHtcbiAgICAgIG5ld1ZhbCA9IEpTT04ucGFyc2UodmFsdWUpO1xuXG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG5ld1ZhbCkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgICAgIHJldHVybiBuZXdWYWw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSl7fVxuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nICYmXG4gICAgICB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gJyc7XG4gICAgfVxuXG4gICAgaWYoIWlzTmFOKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDYW4gcGVyZm9ybSBET20gdHJhbnNmb3JtYXRpb25zIGFuZCBiaW5kIGV2ZW50cyBiZWZvcmUgdGhlIGNvbXBvbmVudCBpc1xuICAgKiAgIGluaXRpYWxpemVkLlxuICAgKi9cbiAgaW5pdGlhbGl6ZSgpIHt9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJlZCBvbmNlIGNoaWxkIGNvbXBvbmVudHMgYXJlIGluaXRpYWxpemVkLlxuICAgKi9cbiAgaW5pdGlhbGl6ZWQoKSB7fVxufVxuXG5pbml0Q29tcG9uZW50cyhDb21wb25lbnQpO1xuaW5pdEV2ZW50cyhDb21wb25lbnQpO1xuXG5cbi8qKlxuICogR3JvdXAgb2YgcmVnZXggdXNlZCBieSB0aGUgYmFzZSBjb21wb25lbnQuXG4gKiBAZW51bSB7UmVnRXhwfVxuICovXG5jb25zdCBSZWdleCA9IHtcbiAgRVZFTlRfU1BMSVRURVI6IC9eKFxcUyspXFxzKiguKikkLyxcbiAgREFUQV9BVFRSX05BTUU6IC9eZGF0YVxcLShbYS16XFxkXFwtXSspJC9cbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbXBvbmVudDtcbiIsImltcG9ydCBcImJhYmVsLXBvbHlmaWxsXCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vR3V0c0NvbXBvbmVudCc7XG5pbXBvcnQgeyBpbml0Q29tcG9uZW50cywgaW5pdEV2ZW50cywgYWRkQ29tcG9uZW50cyB9IGZyb20gJy4vbWl4aW5zJztcblxuXG4vKipcbiAqIEd1dHMuXG4gKi9cbmNsYXNzIEd1dHMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIEd1dHMgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSAge0VsZW1lbnR9IGVsIERPTSBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHtPYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fSBldmVudHMgTGlzdCBvZiBldmVudHMgdGhpcyBpbnN0YW5jZSBjYW5cbiAgICogICBsaXN0ZW4vdHJpZ2dlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsLCB7XG4gICAgZXZlbnRzID0ge31cbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5lbnN1cmVFbGVtZW50XyhlbCk7XG4gICAgdGhpcy5jb21wb25lbnRzID0gR3V0cy5jb21wb25lbnRzO1xuICAgIHRoaXMuZXZlbnRzID0gZXZlbnRzO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcblxuICAgIHRoaXMuaW5pdENvbXBvbmVudHMoKTtcbiAgICB0aGlzLmJyb2FkY2FzdCgnaG9vazppbml0aWFsaXplZCcpO1xuICB9XG5cblxuICAvKipcbiAgICogTWFrZSBzdXJlIGEgRE9NIGVsZW1lbnQgaXMgcHJlc2VudCBpbiBkb2N1bWVudC5cbiAgICogQHBhcmFtICB7RWxlbWVudH0gZWwgRE9NIGVsZW1lbnQuXG4gICAqIEByZXR1cm4ge0VsZW1lbnR9IERvbSBlbGVtZW50IGlmIHByZXNlbnQgaW4gZG9jdW1lbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbnN1cmVFbGVtZW50XyhlbCkge1xuICAgIGlmICghZWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IG5lZWQgRE9NIGVsZW1lbnQgdG8gaW5pdGlhbGl6ZScpO1xuICAgIH1cblxuICAgIGNvbnN0IERPTUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsKTtcbiAgICBpZiAoIURPTUVsZW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRWxlbWVudCBub3QgZm91bmQgaW4gZG9jdW1lbnQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gRE9NRWxlbWVudDtcbiAgfVxufVxuXG5pbml0Q29tcG9uZW50cyhHdXRzKTtcbmluaXRFdmVudHMoR3V0cyk7XG5hZGRDb21wb25lbnRzKEd1dHMsIEd1dHMuY29tcG9uZW50cyk7XG5cbkd1dHMuQ29tcG9uZW50ID0gQ29tcG9uZW50O1xuR3V0cy5jb21wb25lbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbkd1dHMuY29tcG9uZW50ID0gZnVuY3Rpb24oaWQsIGNvbXBvbmVudCkge1xuICBpZiAoIWNvbXBvbmVudCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuY29tcG9uZW50c1tpZF0gPSBjb21wb25lbnQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHdXRzO1xuIl0sIm5hbWVzIjpbImluaXRDb21wb25lbnRzIiwiQ29tcG9uZW50IiwicHJvdG90eXBlIiwiaW5pdENvbXBvbmVudCIsImVsZW1lbnQiLCJkYXRhc2V0IiwiY29tcG9uZW50IiwidHJhdmVyc2VEb20iLCJjaGlsZHJlbiIsImNvbXBvbmVudE5hbWUiLCJjb21wb25lbnRzIiwiaW5pdGlhbGl6ZSIsImJpbmRFdmVudHMiLCJwdXNoIiwiRXJyb3IiLCJlbGVtZW50cyIsImZvckVhY2giLCJpbml0RXZlbnRzIiwib24iLCJldmVudE5hbWUiLCJjYiIsImV2ZW50cyIsImV2ZW50Iiwib25jZSIsIm9uY2VGdW5jdGlvbiIsImFyZ3MiLCJvZmYiLCJhcHBseSIsImVtaXQiLCJjb250ZXh0IiwiaSIsImxlbmd0aCIsInBhcmVudCIsIm5hbWVkRXZlbnQiLCJldmVudEluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImJyb2FkY2FzdCIsImV2ZW50QXJndW1lbnRzIiwiYXJndW1lbnRzIiwiY2hpbGQiLCJhZGRDb21wb25lbnRzIiwiZW5zdXJlRWxlbWVudF8iLCJvcHRpb25zIiwiY29sbGVjdE9wdGlvbnNfIiwiaW5pdGlhbGl6ZWQiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsIm1ldGhvZCIsIm1hdGNoIiwiUmVnZXgiLCJFVkVOVF9TUExJVFRFUiIsImJpbmRFdmVudCIsInF1ZXJ5IiwiYWRkRXZlbnRMaXN0ZW5lciIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJtYXAiLCJlbCIsInVuYmluZEV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIkVsZW1lbnQiLCJhdHRyaWJ1dGVzIiwiZmlsdGVyIiwiYXR0ciIsIkRBVEFfQVRUUl9OQU1FIiwidGVzdCIsIm5hbWUiLCJleGVjIiwicGFyc2VPcHRpb25zXyIsInZhbHVlIiwibmV3VmFsIiwiSlNPTiIsInBhcnNlIiwiT2JqZWN0IiwidG9TdHJpbmciLCJjYWxsIiwiZSIsImlzTmFOIiwicGFyc2VJbnQiLCJHdXRzIiwiRE9NRWxlbWVudCIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImNyZWF0ZSIsImlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQTs7OztBQUlBLEVBQU8sU0FBU0EsY0FBVCxDQUF3QkMsU0FBeEIsRUFBbUM7RUFDeEM7OztFQUdBQSxZQUFVQyxTQUFWLENBQW9CRixjQUFwQixHQUFxQyxZQUFXO0VBQUE7O0VBRTlD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
