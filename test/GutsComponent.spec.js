import Guts from '../src/Guts';

describe('Guts component', function() {

  beforeEach(function() {
    const fixture = `
      <div id="fixture">
        <header id="header" data-component="header">
          <a href="#">Logo</a>
          <nav>
            <ul>
              <li>
                <a href="#">item 1</a>
              </li>
              <li>
                <a href="#">item 2</a>
              </li>
              <li>
                <a href="#">item 3</a>
              </li>
            </ul>
          </nav>
        </header>
        <div id="root" data-component="root">
          <div data-component="header">
            <div data-component="nav">
              <div data-component="link"></div>
            </div>
          </div>
          <div data-component="header"></div>
        </div>
        <header
          id="options"
          data-component="header"
          data-foo
          data-bar="test"
          data-num="2"
          data-obj='{"hello": "world","1": 2}''
        ></header>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin',fixture);
  });

  afterEach(function() {
    document.body.removeChild(document.getElementById('fixture'));
    delete Guts.components;
    Guts.components = Object.create(null);
  });

  it('throws error if initialized with no element', function() {
    class Header extends Guts.Component {};

    expect(function() {
      new Header();
    }).toThrowError('Component should be initialized on an element');
  });

  it('can be instantiated', function() {
    class Header extends Guts.Component {};

    const header = document.getElementById('header');
    const headerComponent = new Header(header);
    expect(headerComponent instanceof Header).toBeTruthy();
  });

  describe('bind events', function() {

    it('on parent element', function() {
      let counter = 0;

      class Header extends Guts.Component {
        constructor(element) {
          super(element);

          this.events = {
            'click': function(e) {
              counter++;
            }
          };
        }
      };

      const header = document.getElementById('header');
      const headerComponent = new Header(header);

      headerComponent.bindEvents();
      expect(counter).toBe(0);

      header.click()
      expect(counter).toBe(1);
    });

    it('on inner elements', function() {
      let counter = 0;

      class Header extends Guts.Component {
        constructor(element) {
          super(element);

          this.events = {
            'click a': function(e) {
              counter++;
            }
          };
        }
      };

      const header = document.getElementById('header');
      const anchors = [...header.querySelectorAll('a')];
      const headerComponent = new Header(header);

      headerComponent.bindEvents();
      expect(counter).toBe(0);

      anchors.forEach(function(anchor, index) {
        anchor.click();
        expect(counter).toBe((index + 1));
      });
    });
  });

  describe('unbind events', function() {

    it('on parent element', function() {
      let counter = 0;

      class Header extends Guts.Component {
        constructor(element) {
          super(element);

          this.events = {
            'click': function(e) {
              counter++;
            }
          };
        }
      };

      const header = document.getElementById('header');
      const headerComponent = new Header(header);

      headerComponent.bindEvents();
      expect(counter).toBe(0);

      header.click()
      expect(counter).toBe(1);

      headerComponent.unbindEvents();

      header.click()
      expect(counter).toBe(1);
    });

    it('on inner elements', function() {
      let counter = 0;
      let indexCounter = 0;

      class Header extends Guts.Component {
        constructor(element) {
          super(element);

          this.events = {
            'click a': function(e) {
              counter++;
            }
          };
        }
      };

      const header = document.getElementById('header');
      const anchors = [...header.querySelectorAll('a')];
      const headerComponent = new Header(header);

      headerComponent.bindEvents();
      expect(counter).toBe(0);

      anchors.forEach(function(anchor, index) {
        anchor.click();
        expect(counter).toBe(indexCounter+=1);
      });

      headerComponent.unbindEvents();

      anchors.forEach(function(anchor, index) {
        anchor.click();
        expect(counter).toBe(indexCounter);
      });
    });
  });

  describe('events', function() {
    it('register single event', function() {
      class Header extends Guts.Component {};

      const header = document.getElementById('header');
      const headerComponent = new Header(header);
      headerComponent.on('test', function() {});
      expect(headerComponent.events.test).toBeDefined();
      expect(headerComponent.events.test.length).toBe(1);
    });

    it('register multiple events', function() {
      class Header extends Guts.Component {};

      const header = document.getElementById('header');
      const headerComponent = new Header(header);
      headerComponent.on('test', function() {});
      expect(headerComponent.events.test).toBeDefined();
      expect(headerComponent.events.test.length).toBe(1);

      headerComponent.on('test', function() {});
      expect(headerComponent.events.test.length).toBe(2);
    });

    it('unregister an event', function() {
      let counter = 0;
      class Header extends Guts.Component {};

      const header = document.getElementById('header');
      const headerComponent = new Header(header);

     const testCb = function() {
        counter+=1;
      }

      headerComponent.on('test', testCb);
      headerComponent.emit('test');
      expect(counter).toBe(1);

      headerComponent.off('test', testCb);
      headerComponent.emit('test');
      expect(counter).toBe(1);
    });

    it('emits on self', function() {
      let counter = 0;
      class Header extends Guts.Component {};

      const header = document.getElementById('header');
      const headerComponent = new Header(header);
      headerComponent.on('test', function() {
        counter+=1;
      });
      headerComponent.emit('test');
      expect(counter).toBe(1);
    });

    it('emits with arguments', function() {
      let counter = 0;
      class Header extends Guts.Component {};

      const header = document.getElementById('header');
      const headerComponent = new Header(header);
      headerComponent.on('test', function(num) {
        counter = num
      });
      headerComponent.emit('test', 1);
      expect(counter).toBe(1);

      headerComponent.emit('test', 20);
      expect(counter).toBe(20);
    });

    it('emit all the way up', function() {
      let counter = 0;
      function addToCounter() {
        counter+= 1;
      }

      class Root extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
        }
      };
      Root.prototype.components = Guts.components;
      class Header extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
        }
      };
      class Nav extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
        }
      };
      class Link extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
          this.emit('test');
        }
      };

      Guts.component('root', Root);
      Guts.component('header', Header);
      Guts.component('nav', Nav);
      Guts.component('link', Link);

      const root = document.getElementById('root');
      const rootComponent = new Root(root);
      rootComponent.initialize();
      rootComponent.initComponents();
      expect(counter).toBe(4);
    });

    it('broadcast to children', function() {
      let counter = 0;
      function addToCounter() {
        counter+= 1;
      }

      class Root extends Guts.Component {};
      Root.prototype.components = Guts.components;
      class Header extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
        }
      };
      class Nav extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
        }
      };
      class Link extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
        }
      };

      Guts.component('root', Root);
      Guts.component('header', Header);
      Guts.component('nav', Nav);
      Guts.component('link', Link);

      const root = document.getElementById('root');
      const rootComponent = new Root(root);
      rootComponent.initialize();
      rootComponent.initComponents();
      rootComponent.broadcast('test');
      expect(counter).toBe(4);
    });

    it('broadcast to children with arguments', function() {
      let counter = 0;
      function addToCounter(number) {
        counter+= number;
      }

      class Root extends Guts.Component {};
      Root.prototype.components = Guts.components;
      class Header extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
        }
      };
      class Nav extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
        }
      };
      class Link extends Guts.Component {
        initialize() {
          this.on('test', addToCounter);
        }
      };

      Guts.component('root', Root);
      Guts.component('header', Header);
      Guts.component('nav', Nav);
      Guts.component('link', Link);

      const root = document.getElementById('root');
      const rootComponent = new Root(root);
      rootComponent.initialize();
      rootComponent.initComponents();
      rootComponent.broadcast('test', 1);
      expect(counter).toBe(4);
    });

    it('register once an event', function() {
      let counter = 0;
      class Header extends Guts.Component {};

      const header = document.getElementById('header');
      const headerComponent = new Header(header);
      headerComponent.once('test', function() {
        counter+=1;
      });
      headerComponent.emit('test');
      expect(counter).toBe(1);

      headerComponent.emit('test');
      expect(counter).toBe(1);
    });

    it('register once an event with arguments', function() {
      let counter = 0;
      class Header extends Guts.Component {};

      const header = document.getElementById('header');
      const headerComponent = new Header(header);
      headerComponent.once('test', function(number) {
        counter+=number;
      });
      headerComponent.emit('test', 1);
      expect(counter).toBe(1);

      headerComponent.emit('test', 4);
      expect(counter).toBe(1);
    });
  });

  describe('data attribute options', function() {
    it('accepts boolean attributes', function() {
      class Header extends Guts.Component {};

      const header = document.getElementById('options');
      const headerComponent = new Header(header);

      expect(headerComponent.options.foo).toBeDefined();
      expect(headerComponent.options.foo).toBe(true);
    });

    it('accepts string attributes', function() {
      class Header extends Guts.Component {};

      const header = document.getElementById('options');
      const headerComponent = new Header(header);

      expect(headerComponent.options.bar).toBeDefined();
      expect(headerComponent.options.bar).toBe('test');
    });

    it('accepts number attributes', function() {
      class Header extends Guts.Component {};

      const header = document.getElementById('options');
      const headerComponent = new Header(header);

      expect(headerComponent.options.num).toBeDefined();
      expect(headerComponent.options.num).toBe(2);
    });

    it('accepts object attributes', function() {
      const obj = {
        hello: 'world',
        1: 2
      };

      class Header extends Guts.Component {};

      const header = document.getElementById('options');
      const headerComponent = new Header(header);

      expect(headerComponent.options.obj).toBeDefined();
      expect(headerComponent.options.obj).toEqual(obj);
    });
  });
});
