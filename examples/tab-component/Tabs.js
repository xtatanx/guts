(function() {
  class Tabs extends Guts.Component {
    constructor(element, parent) {
      super(element, parent);
    }

    initialize() {
      this.on('tab:clicked', (index, changeFocus) => {
        if (index < 1) {
          index = 1;
        }

        if (index > (this.tabs.length)) {
          index = this.tabs.length;
        }

        this.broadcast('tab:change', index, changeFocus);
      });
    }

    initialized() {
      this.tabs = this.children.filter((element) => {
        return element.constructor.name === 'Tab';
      });

      this.broadcast('tab:change', (this.options.index || 1));
    }
  }

  Guts.component('tabs', Tabs);
})();
