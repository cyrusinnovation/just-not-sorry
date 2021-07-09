import { h } from 'preact';
import JustNotSorry from '../src/components/JustNotSorry.js';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() });
jest.useFakeTimers();

document.createRange = jest.fn(() => ({
  setStart: jest.fn(),
  setEnd: jest.fn(),
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
  startContainer:
    "The word 'very' does not communicate enough information. Find a stronger, more meaningful adverb, or omit it completely. --Andrea Ayres",
  getClientRects: jest.fn(() => [{}]),
}));

const buildWarning = (pattern, message) => ({
  regex: new RegExp(pattern, 'ig'),
  message,
});

const enterText = (text) => {
  return mount(
    <div props={{ id: 'div-focus' }} contentEditable={'true'}>
      {text ?? ''}
    </div>
  );
};

describe('JustNotSorry', () => {
  let wrapper, instance, mutationObserverMock;

  const simulateEvent = (node, event) => {
    const domNode = node.getDOMNode();
    const documentObserver = mutationObserverMock.mock.instances[0];
    documentObserver.trigger([{ type: 'childList', target: domNode }]);
    node.simulate(event);
    jest.runOnlyPendingTimers();
  };

  beforeEach(() => {
    mutationObserverMock = jest.fn(function MutationObserver(callback) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.trigger = (mockedMutationList) => {
        callback(mockedMutationList, this);
      };
    });
    global.MutationObserver = mutationObserverMock;

    wrapper = mount(<JustNotSorry />);
    instance = wrapper.instance();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('documentObserver', () => {
    it('listens for structural changes to the content editable div in document body', () => {
      const observerInstances = mutationObserverMock.mock.instances;
      expect(observerInstances.length).toBe(1);
      expect(observerInstances[0].observe).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
      });
    });
  });

  describe('#handleSearch', () => {
    let handleSearch;

    beforeEach(() => {
      handleSearch = jest.spyOn(instance, 'handleSearch');
    });

    const assertHandlerWasCalled = () => {
      expect(handleSearch).toHaveBeenCalledTimes(1);
    };

    afterEach(assertHandlerWasCalled);

    describe('on focus', () => {
      it('checks for warnings', () => {
        const node = enterText('just not sorry');

        simulateEvent(node, 'focus');

        expect(wrapper.state('warnings').length).toEqual(2);
      });

      it('does nothing when given an empty string', () => {
        const node = enterText();

        simulateEvent(node, 'focus');

        expect(wrapper.state('warnings').length).toEqual(0);
      });
    });

    describe('on input', () => {
      it('updates warnings each time input is triggered', () => {
        const node = enterText('just not sorry');

        simulateEvent(node, 'input');
      });
    });

    describe('on cut', () => {
      it('updates warnings each time input is triggered', () => {
        const node = enterText('just not sorry');

        simulateEvent(node, 'cut');
      });
    });
  });

  describe('#resetState', () => {
    describe('on blur', () => {
      it('removes any existing warnings', () => {
        const spy = jest.spyOn(instance, 'resetState');

        const node = enterText('just not sorry');

        simulateEvent(node, 'blur');

        expect(spy).toHaveBeenCalledTimes(1);
        expect(wrapper.state('warnings').length).toEqual(0);
      });
    });
  });

  describe('#updateWarnings', () => {
    it('updates state and parentNode for a match', () => {
      const elem = enterText('test!!!');

      const domNode = elem.getDOMNode();
      instance.updateWarnings(domNode, [
        buildWarning('\\b!{3,}\\B', 'warning message'),
      ]);

      expect(wrapper.state('warnings').length).toBe(1);
      expect(wrapper.state('parentNode')).toBe(domNode.parentNode);
    });

    it('does not add warnings for tooltip matches', () => {
      const node = enterText('test justify test');
      simulateEvent(node, 'focus');
      expect(wrapper.state('warnings').length).toBe(0);
    });
  });
});
