import "babel-polyfill";
import Component from './GutsComponent';
import { initComponents, initEvents, addComponents } from './mixins';


/**
 * Guts.
 */
class Guts {
  /**
   * Creates a Guts instance.
   * @param  {Element} el DOM element.
   * @param  {Object.<string, function>} events List of events this instance can
   *   listen/trigger.
   */
  constructor(el, {
    events = {}
  } = {}) {
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
  ensureElement_(el) {
    if (!el) {
      throw new Error('You need DOM element to initialize');
    }

    const DOMElement = document.querySelector(el);
    if (!DOMElement) {
      throw new Error('Element not found in document');
    }

    return DOMElement;
  }
}

initComponents(Guts);
initEvents(Guts);
addComponents(Guts, Guts.components);

Guts.Component = Component;
Guts.components = Object.create(null);
Guts.component = function(id, component) {
  if (!component) {
    return;
  }

  this.components[id] = component;
};

export default Guts;
