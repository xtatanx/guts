import "babel-polyfill";
import Component from './GutsComponent';
import { initComponents, initEvents, addComponents } from './mixins';

class Guts {
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
