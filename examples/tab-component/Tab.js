(function() {
  class Tab extends Guts.Component {
    constructor(element, parent) {
      super(element, parent);

      this.onTabChange_ = this.onTabChange_.bind(this);
      this.handleKeyPress_ = this.handleKeyPress_.bind(this);

      this.events = {
        'click': this.onTabChange_,
        'keydown': this.handleKeyPress_
      };
    }

    initialize() {
      this.on('tab:change', (index, shouldFocus) => {
        if(this.options.index === index) {
          this.element.classList.add('active');
          this.element.removeAttribute('tabindex');
          this.element.setAttribute('aria-selected', true);

          if(shouldFocus) {
            this.element.focus();
          }
        } else {
          this.element.classList.remove('active');
          this.element.setAttribute('tabindex', -1);
          this.element.setAttribute('aria-selected', false);
        }
      });
    }

    onTabChange_() {
      this.emit('tab:clicked', this.options.index);
    }

    handleKeyPress_(e) {
      if (e.keyCode === 39) {
        this.emit('tab:clicked', this.options.index + 1, true);
      }

      if (e.keyCode === 37) {
        this.emit('tab:clicked', this.options.index - 1, true);
      }
    }
  }

  Guts.component('tab', Tab);
})();
