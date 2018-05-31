export function initComponents(Component) {
  Component.prototype.initComponents = function() {

    const initComponent = (element) => {
      if (!element.dataset.component) {
        return traverseDom([...element.children]);
      }

      const componentName = element.dataset.component;
      const Component = this.components[componentName];

      if (Component) {
        Component.prototype.components = this.components;
        const component = new Component(element, this);
        component.initialize();
        component.initComponents();
        component.bindEvents();
        this.children.push(component);
      } else {
        throw new Error(`Component ${componentName} is not registered`);
      }
    }

    const traverseDom = (elements) => {
      elements.forEach((element) => {
        initComponent(element);
      });
    }

    const children = [...this.element.children];

    traverseDom(children);
  };
};

export function initEvents(Component) {
  Component.prototype.on = function(eventName, cb) {

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    const event = this.events[eventName];

    event.push(cb);
  };

  Component.prototype.once = function(eventName, cb) {
    const onceFunction = (...args) => {
      this.off(eventName, onceFunction);
      cb.apply(null, args);
    };

    this.on(eventName, onceFunction);
  };

  Component.prototype.emit = function(eventName, ...args) {
    let context = this;

    do {
      if (context.events[eventName]) {
        let events = context.events[eventName];
        for (let i = 0; i < events.length; i++ ) {
          events[i].apply(null, args);
        }
      }

      context = context.parent;

    } while(context);
  };

  Component.prototype.off = function(eventName, cb) {
    const namedEvent = this.events[eventName];

    if(!namedEvent) {
      return;
    }

    const eventIndex = namedEvent.indexOf(cb);

    if(eventIndex !== -1) {
      namedEvent.splice(eventIndex, 1);
    }
  };

  Component.prototype.broadcast = function(eventName, ...args) {
    const children = this.children;

    if (children.length === 0) {
      return;
    }

    const eventArguments = [...arguments];

    children.forEach(function(child) {
      if (child.events[eventName]) {
        let events = child.events[eventName];
        for (let i = 0; i < events.length; i++ ) {
          events[i].apply(null, args);
        }
      }

      child.broadcast.apply(child, eventArguments);
    });
  };
};

export function addComponents(Component, components) {
  Component.prototype.components = components;
};
