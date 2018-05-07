import { initComponents, initEvents} from './mixins';

class Component {
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


  ensureElement_(element) {
    if (!element || !(element instanceof Element)) {
      throw new Error('Component should be initialized on an element');
    }

    return element;
  }

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



  initialize() {}
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
