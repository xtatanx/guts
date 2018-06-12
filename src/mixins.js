/**
 * Initialize component mixin for Guts and Guts.Component.
 * @param  {Guts|Component} Component Component to mix.
 */
export function initComponents(Component) {
  /**
   * Traverse DOM looking for child components and initialize them.
   */
  Component.prototype.initComponents = function() {

    /**
     * Initialize a component or if the element is not a component recursively check
     * for children elements to initialize.
     * @param  {Element} element DOM element.
     */
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


/**
 * Initialize the events mixin.
 * @param  {Guts|Component} Component Component to mix.
 */
export function initEvents(Component) {

  /**
   * Listen to an event.
   * @param  {string} eventName Name of the event to start listening to.
   * @param  {function} cb Function to execute when triggered.
   */
  Component.prototype.on = function(eventName, cb) {

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    const event = this.events[eventName];

    event.push(cb);
  };


  /**
   * Listen to an event once.
   * @param  {string} eventName Name of the event to start listening to.
   * @param  {function} cb Function to execute when triggered.
   */
  Component.prototype.once = function(eventName, cb) {
    const onceFunction = (...args) => {
      this.off(eventName, onceFunction);
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


  /**
   * Stop listening on an event.
   * @param  {string} eventName Name of the event to start listening to.
   * @param  {function} cb Function that was attached to the listener.
   */
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


  /**
   * Broadcast an event all the way down into the chain of components.
   * @param  {string} eventName Name of the event to broadcast.
   * @param  {*} args Any argument we want to pass to callback.
   */
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


/**
 * Add components mixin. Every instance has a COImponents property it can use
 * to instantiate them..
 * @param {Guts|Component} Component Instance to add component.
 * @param {array[Component]} components Array of components registered by the
 *   user.
 */
export function addComponents(Component, components) {
  Component.prototype.components = components;
};
