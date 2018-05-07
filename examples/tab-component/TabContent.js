(function() {
  class TabContent extends Guts.Component {
    initialize() {
      this.element.style.display = 'none'
      this.on('tab:change', (index) => {
        if(this.options.index === index) {
          this.element.style.display = 'block'
          this.element.removeAttribute('hidden');
        } else {
          this.element.style.display = 'none'
          this.element.setAttribute('hidden', 'hidden');
        }
      });
    }
  }

  Guts.component('tab-content', TabContent);
})();
