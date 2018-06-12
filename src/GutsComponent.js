import { initComponents, initEvents} from './mixins';

/**
 * Guts Component.
 */
class Component {
  /**
   * Creates a Guts component.
   * @param  {Element} element Dom element to be transformed into component.
   * @param  {Guts|Component} parent Guts instance if root  or a component
   *   instance if child component.
   */
  constructor(element, parent=null) {
    this.element = this.ensureElement_(element);
    this.options = this.collectOptions_();
    this.events = {};
    this.children = [];
    this.parent = parent;
    this.on('hook:initialized', () => {
      this.initialized();
    });
  }


  /**
   * Bind multiple events found in the events property.
   * @return {Component} For chaining purposes.
   */
  bindEvents() {
    const events = this.events;

    if (!events) {
      return;
    }

    for (let key in events) {
      if (events.hasOwnProperty(key)) {
        let method = events[key];

        if (!typeof method === 'function') {
          method = this[method];
        }

        if (!method) {
          continue;
        }

        let match = key.match(Regex.EVENT_SPLITTER);

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
  bindEvent(event, query, method) {
    if (!query || !query.length) {
      this.element.addEventListener(event, method, false);

      return this;
    }

    [...this.element.querySelectorAll(query)].map((el) => {
      el.addEventListener(event, method, false);
    });

    return this;
  }


  /**
   * Unbind all the events found in the events property.
   * @return {Component} For chaining purposes.
   */
  unbindEvents() {
    const events = this.events;

    if (!events) {
      return;
    }

    for (let key in events) {
      if (events.hasOwnProperty(key)) {
        let method = events[key];

        if (!typeof method === 'function') {
          method = this[method];
        }

        if (!method) {
          continue;
        }

        let match = key.match(Regex.EVENT_SPLITTER);

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
  unbindEvent(event, query, method) {
    if (!query || !query.length) {
      this.element.removeEventListener(event, method, false);

      return this;
    }

    [...this.element.querySelectorAll(query)].map((el) => {
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
  ensureElement_(element) {
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
  collectOptions_() {
    const options = {};
    const attributes = [...this.element.attributes]
    .filter((attr) => {
      return Regex.DATA_ATTR_NAME.test(attr.name) &&
        attr.name !== 'data-component';
    })
    .forEach((attr) => {
      options[Regex.DATA_ATTR_NAME.exec(attr.name)[1]] =
        this.parseOptions_(attr.value);
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
  parseOptions_(value) {
    let newVal;

    try {
      newVal = JSON.parse(value);

      if (Object.prototype.toString.call(newVal) === '[object Object]') {
        return newVal;
      }
    } catch (e){}

    if (Object.prototype.toString.call(value) === '[object String]' &&
      value.length === 0) {
      return value === '';
    }

    if(!isNaN(value)) {
      return parseInt(value);
    }

    return value;
  }


  /**
   * Can perform DOm transformations and bind events before the component is
   *   initialized.
   */
  initialize() {}

  /**
   * Triggered once child components are initialized.
   */
  initialized() {}
}

initComponents(Component);
initEvents(Component);


/**
 * Group of regex used by the base component.
 * @enum {RegExp}
 */
const Regex = {
  EVENT_SPLITTER: /^(\S+)\s*(.*)$/,
  DATA_ATTR_NAME: /^data\-([a-z\d\-]+)$/
};

export default Component;
