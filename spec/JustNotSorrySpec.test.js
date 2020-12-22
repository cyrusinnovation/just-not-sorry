import { h } from 'preact';
import JustNotSorry from '../src/components/JustNotSorry.js';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() });

describe('JustNotSorry', () => {
  let justNotSorry;

  let editableDiv1;
  let editableDiv2;
  let editableDiv3;
  let wrapper;
  let instance;

  const mutationObserverMock = jest.fn(function MutationObserver(callback) {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    this.trigger = (mockedMutationList) => {
      callback(mockedMutationList, this);
    };
  });

  document.createRange = jest.fn(() => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    startContainer: 'test',
    getClientRects: jest.fn(() => [{}]),
  }));

  global.MutationObserver = mutationObserverMock;

  const divsForCleanUp = [];

  function generateEditableDiv(props, innerHtml) {
    const divNode = mount(
      <div {...props} contentEditable={'true'}>
        {innerHtml ? innerHtml : ''}
      </div>
    );
    divsForCleanUp.push(divNode);
    return divNode;
  }

  beforeEach(() => {
    justNotSorry = mount(<JustNotSorry />);
    wrapper = justNotSorry;
    instance = justNotSorry.instance();
    editableDiv1 = generateEditableDiv({ id: 'div-1' });
    editableDiv2 = generateEditableDiv({ id: 'div-2' }, 'test just test');
    editableDiv3 = generateEditableDiv({ id: 'div-3' }, 'test justify test');
  });

  afterEach(() => {
    divsForCleanUp.forEach((divNode) => divNode.unmount());
    divsForCleanUp.length = 0;
    justNotSorry.unmount();
  });

  describe('#addObserver', () => {
    it('adds an observer that listens for structural changes to the content editable div', () => {
      const spy = jest.spyOn(instance, 'addObserver');
      const node = generateEditableDiv({
        id: 'div-focus',
        onFocus: instance.addObserver.bind(instance),
      });
      node.simulate('focus');

      // There should be the document observer and the observer specifically for the target div
      const observerInstances = mutationObserverMock.mock.instances;
      const observerInstance = observerInstances[observerInstances.length - 1];

      expect(observerInstances.length).toBe(2);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(observerInstance.observe).toHaveBeenCalledWith(node.getDOMNode(), {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true,
      });

      node.unmount();
    });

    it('starts checking for warnings', () => {
      const spy = jest.spyOn(instance, 'checkForWarnings');
      const node = generateEditableDiv({
        id: 'div-focus',
        onFocus: instance.addObserver.bind(instance),
      });
      node.simulate('focus');

      expect(spy).toHaveBeenCalled();

      node.unmount();
    });

    it('adds warnings to the content editable div', () => {
      const spy = jest.spyOn(instance, 'addWarnings');
      const node = generateEditableDiv({
        id: 'div-focus',
        onFocus: instance.addObserver.bind(instance),
      });
      node.simulate('focus');

      expect(spy).toHaveBeenCalledWith(node.getDOMNode().parentNode);

      node.unmount();
    });
  });

  describe('#removeObserver', () => {
    it('removes any existing warnings', () => {
      const spy = jest.spyOn(instance, 'removeObserver');
      const node = generateEditableDiv(
        {
          id: 'div-focus',
          onFocus: instance.addObserver.bind(instance),
          onBlur: instance.removeObserver.bind(instance),
        },
        'just not sorry'
      );
      node.simulate('focus');

      expect(justNotSorry.state('warnings').length).toEqual(2);

      // remount the node
      node.mount();
      node.simulate('blur');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(justNotSorry.state('warnings').length).toEqual(0);

      node.unmount();
    });

    it('no longer checks for warnings on input events', () => {
      justNotSorry.unmount();
      justNotSorry.mount();
      const node = generateEditableDiv({
        id: 'div-remove',
        onFocus: instance.addObserver.bind(instance),
        onBlur: instance.removeObserver.bind(instance),
      });
      node.simulate('focus');
      node.simulate('blur');

      const spy = jest.spyOn(instance, 'checkForWarnings');

      node.simulate('input');

      expect(spy).not.toHaveBeenCalled();

      node.unmount();
    });

    it('disconnects the observer', () => {
      const spy = jest.spyOn(instance, 'removeObserver');
      const node = generateEditableDiv({
        id: 'div-disconnect',
        onFocus: instance.addObserver.bind(instance),
        onBlur: instance.removeObserver.bind(instance),
      });
      node.simulate('focus');
      node.simulate('blur');

      // There should be the document observer and the observer specifically for the target div
      const observerInstances = mutationObserverMock.mock.instances;
      const observerInstance = observerInstances[observerInstances.length - 1];

      expect(spy).toHaveBeenCalled();
      expect(observerInstance.disconnect).toHaveBeenCalled();

      node.unmount();
    });
  });

  describe('#addWarning', () => {
    it('adds a warning for a single keyword', () => {
      const node = editableDiv2.getDOMNode();
      instance.addWarning(node, 'just', 'warning message');

      expect(wrapper.state('warnings').length).toEqual(1);
      expect(wrapper.state('warnings')[0]).toEqual(
        expect.objectContaining({
          keyword: 'just',
          message: 'warning message',
          parentNode: node,
        })
      );
    });

    it('does not add warnings for partial matches', () => {
      const node = editableDiv3.getDOMNode();
      instance.addWarning(node, 'just', 'warning message');

      expect(wrapper.state('warnings').length).toEqual(0);
      expect(wrapper.state('warnings')).toEqual([]);
    });

    it('matches case insensitive', () => {
      const node = generateEditableDiv(
        { id: 'div-case' },
        'jUsT kidding'
      ).getDOMNode();

      instance.addWarning(node, 'just', 'warning message');
      expect(wrapper.state('warnings').length).toEqual(1);
      expect(wrapper.state('warnings')[0]).toEqual(
        expect.objectContaining({
          keyword: 'just',
          message: 'warning message',
          parentNode: node,
        })
      );
    });

    it('catches keywords with punctuation', () => {
      const node = generateEditableDiv(
        { id: 'div-punctuation' },
        'just. test'
      ).getDOMNode();

      instance.addWarning(node, 'just', 'warning message');
      expect(wrapper.state('warnings').length).toEqual(1);
      expect(wrapper.state('warnings')[0]).toEqual(
        expect.objectContaining({
          keyword: 'just',
          message: 'warning message',
          parentNode: node,
        })
      );
    });

    it('matches phrases', () => {
      const node = generateEditableDiv(
        { id: 'div-phrase' },
        'my cat is so sorry because of you'
      ).getDOMNode();

      instance.addWarning(node, 'so sorry', 'warning message');
      expect(wrapper.state('warnings').length).toEqual(1);
      expect(wrapper.state('warnings')[0]).toEqual(
        expect.objectContaining({
          keyword: 'so sorry',
          message: 'warning message',
          parentNode: node,
        })
      );
    });

    it('does not add warnings for tooltip matches', () => {
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

      const node = editableDiv3.getDOMNode();
      instance.addWarning(node, 'very', 'warning message');

      expect(wrapper.state('warnings').length).toEqual(0);
      expect(wrapper.state('warnings')).toEqual([]);
    });
  });

  describe('#addWarnings', () => {
    beforeEach(() => {
      instance = wrapper.instance();
    });

    it('does nothing when given an empty string', () => {
      const node = editableDiv1.getDOMNode();
      instance.addWarnings(node);

      expect(wrapper.state('warnings').length).toEqual(0);
      expect(wrapper.state('warnings')).toEqual([]);
    });

    it('adds warnings to all keywords', () => {
      const node = generateEditableDiv(
        { id: 'div-keywords' },
        'I am just so sorry. Yes, just.'
      ).getDOMNode();

      instance.addWarnings(node);
      expect(wrapper.state('warnings').length).toEqual(3);
    });
  });

  describe('#checkForWarnings', () => {
    it('updates warnings each time input is triggered', () => {
      const spy = jest.spyOn(instance, 'checkForWarnings');
      const node = generateEditableDiv(
        { id: 'test', onInput: instance.checkForWarnings },
        'just not sorry'
      );

      node.simulate('input');
      node.simulate('input');
      node.simulate('input');
      expect(spy).toHaveBeenCalledTimes(3);
      node.unmount();
    });
  });

  describe('#handleContentEditableDivChange', () => {
    describe('when a new content editable div is added', () => {
      it('should apply the event listeners', () => {
        const id = 'testing';
        const spy = jest
          .spyOn(instance, 'applyEventListeners')
          .mockImplementationOnce(() => {});

        jest.spyOn(instance, 'getEditableDivs').mockReturnValue([1]);
        const node = generateEditableDiv({ id }, 'just not sorry');
        const mockMutation = {
          type: 'childList',
          target: node.getDOMNode(),
        };
        const mutations = [mockMutation];

        instance.handleContentEditableDivChange(mutations);

        expect(spy).toHaveBeenCalledWith(node.getDOMNode());
      });

      describe('and the new div does not have an id', () => {
        it('should still apply the event listeners', () => {
          const spy = jest
            .spyOn(instance, 'applyEventListeners')
            .mockImplementationOnce(() => {});

          jest.spyOn(instance, 'getEditableDivs').mockReturnValue([1]);
          const node = generateEditableDiv({}, 'just not sorry');
          const mockMutation = {
            type: 'childList',
            target: node.getDOMNode(),
          };
          const mutations = [mockMutation];

          instance.handleContentEditableDivChange(mutations);

          expect(spy).toHaveBeenCalledWith(node.getDOMNode());
        });
      });
    });
  });
});
