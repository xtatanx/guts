import Guts from '../src/Guts';

class Header extends Guts.Component {};
class Nav extends Guts.Component {};
class Dropdown extends Guts.Component {};
class Tooltip extends Guts.Component {};

describe('Guts', function() {

  beforeEach(function() {
    const fixture = `
      <div id="fixture">
        <div id="root">
          <h1>Hello World</h1>
          <header data-component="header">
            <a href="#">Logo</a>
            <nav>
              <ul>
                <li>
                  <a href="">item 1</a>
                </li>
                <li>
                  <a href="">item 2</a>
                </li>
                <li>
                  <a href="">item 3</a>
                </li>
              </ul>
            </nav>
          </header>
        </div>
        <div class="root">
          <h1>Hello World</h1>
          <div data-component="foo"></div>
        </div>
        <div data-root>
          <h1>Hello World</h1>
          <header data-component="header"></header>
          <div data-component="tooltip"></div>
        </div>
        <div id="nested">
          <header data-component="header">
            <nav data-component="nav"></nav>
          </header>
          <div data-component="tooltip"></div>
        </div>
        <div id="initialized">
          <div data-component="initialized"></div>
          <div data-component="initialized2"></div>
        </div>
        <div id="bind-events">
          <a id="click-trigger" href="#clicked" data-component="bind-events">Click me</a>
        </div>
        <div id="emit-events">
          <div data-component="wrapper">
            <div data-component="tabs">
              <ul>
                <li data-component="tab">
                  <a href="#">test</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin',fixture);
    Guts.component('header', Header);
    Guts.component('nav', Nav);
    Guts.component('dropdown', Dropdown);
    Guts.component('tooltip', Tooltip);
  });

  afterEach(function() {
    document.body.removeChild(document.getElementById('fixture'));
    delete Guts.components;
    Guts.components = Object.create(null);
  });

  it('has empty components map', function() {
    expect(Guts.components).toBeDefined({});
  });

  it('register component', function() {
    Guts.component('dropdown', Dropdown);
    expect(Guts.components['dropdown']).toBeDefined();
    expect(Guts.components['tooltip']).toBeDefined();
    expect(Guts.components['header']).toBeDefined();
    expect(Guts.components['nav']).toBeDefined();
  });

  it('Throws error if no element is present', function() {
    expect(function() {
      new Guts();
    }).toThrowError('You need DOM element to initialize');
  });

  it('can be initialized on DOM element', function() {
    expect(function() {
      new Guts('#foo');
    }).toThrowError('Element not found in document');

    const initId = new Guts('#root');
    expect(initId).toBeDefined();

    const initData = new Guts('[data-root]');
    expect(initData).toBeDefined();
  });

  describe('initialize components', function() {

    it('throws error on unregistered component', function() {
      expect(function() {
        new Guts('.root')
      }).toThrowError('Component foo is not registered');
    });

    it('one component', function() {
      const foo = new Guts('#root');
      expect(foo.children[0] instanceof Header).toBeTruthy();
    });

    it('sibling components', function() {
      const foo = new Guts('[data-root]');
      expect(foo.children[0] instanceof Header).toBeTruthy();
      expect(foo.children[1] instanceof Tooltip).toBeTruthy();
    });

    it('nested components', function() {
      const nested = new Guts('#nested');
      expect(nested.children[0] instanceof Header).toBeTruthy();
      expect(nested.children[1] instanceof Tooltip).toBeTruthy();
      expect(nested.children[0].children[0] instanceof Nav).toBeTruthy();
    });

    it('pass a reference of parent component', function() {
      const nested = new Guts('#nested');
      expect(nested.children[0].parent instanceof Guts).toBeTruthy();
      expect(nested.children[0].children[0].parent instanceof Header).toBeTruthy();
    });

    it('call initialize function', function() {
      let counter = 0;
      let counter2 = 0;

      class Initialized extends Guts.Component {
        initialize() {
          counter++;
        }
      }

      class Initialized2 extends Guts.Component {
        initialize() {
          counter2++;
        }
      }

      Guts.component('initialized', Initialized);
      Guts.component('initialized2', Initialized2);

      new Guts('#initialized');
      expect(counter).toBe(1);
      expect(counter2).toBe(1);
    });

    it('call bind events', function() {
      let counter = 0;

      class bindEvents extends Guts.Component {
        constructor(element) {
          super(element);

          this.events = {
            'click': function(e) {
              e.preventDefault();
              counter++;
            }
          };
        }
      }

      Guts.component('bind-events', bindEvents);

      new Guts('#bind-events');
      const trigger = document.getElementById('click-trigger');
      trigger.click();
      expect(counter).toBe(1);
    });
  });

  describe('broadcast', function() {

    it('from root', function() {
      let callCount = 0;

      class Wrapper extends Guts.Component {
        initialize() {
          this.on('test', this.handleTest);
        };

        handleTest() {
          callCount+= 1;
        }
      };

      class Tabs extends Guts.Component {
        initialize() {
          this.on('test', this.handleTest);
        };

        handleTest() {
          callCount+= 1;
        }
      };

      class Tab extends Guts.Component {
        initialize() {
          this.on('test', this.handleTest);
        };

        handleTest() {
          callCount+= 1;
        }
      };

      Guts.component('wrapper', Wrapper);
      Guts.component('tabs', Tabs);
      Guts.component('tab', Tab);

      const rootComponent = new Guts('#emit-events');

      rootComponent.broadcast('test');

      expect(callCount).toBe(3);
    });
  });
});
