import { h, Component } from 'preact';
import ReactDOM from 'react-dom';
import Warning from './Warning.js';
import * as Util from '../helpers/util.js';
import PHRASES from '../warnings/phrases.json';
import { forEachUniqueContentEditable } from '../callbacks/ContentEditableDiv';
import { findRanges } from '../helpers/RangeFinder';

const WAIT_TIME_BEFORE_RECALC_WARNINGS = 500;

const MESSAGE_PATTERNS = PHRASES.map((phrase) => ({
  regex: new RegExp(phrase.pattern, 'gi'),
  message: phrase.message,
}));

const WATCH_FOR_NEW_NODES = {
  subtree: true,
  childList: true,
};

class JustNotSorry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parentNode: {},
      warnings: [],
    };

    this.resetState = this.resetState.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.updateWarnings = this.updateWarnings.bind(this);
    this.applyEventListeners = this.applyEventListeners.bind(this);

    this.documentObserver = new MutationObserver(
      forEachUniqueContentEditable(this.applyEventListeners)
    );
    this.documentObserver.observe(document.body, WATCH_FOR_NEW_NODES);
  }

  resetState() {
    this.setState({ parentNode: {}, warnings: [] });
  }

  updateWarnings(email, patterns) {
    const newWarnings =
      email.children.size > 0
        ? Array.from(email.children)
            .filter((node) => node.text !== '')
            .flatMap((node) => findRanges(node, patterns))
        : findRanges(email, patterns);
    this.setState(({ parentNode }) =>
      parentNode.id !== email.parentNode.id
        ? { parentNode: email.parentNode, warnings: newWarnings }
        : { parentNode, warning: newWarnings }
    );
    this.setState({ parentNode: email.parentNode, warnings: newWarnings });
  }

  handleSearch(email, patterns) {
    return Util.debounce(
      () => this.updateWarnings(email, patterns),
      WAIT_TIME_BEFORE_RECALC_WARNINGS
    );
  }

  applyEventListeners(mutation) {
    const email = mutation.target;
    const searchHandler = this.handleSearch(email, MESSAGE_PATTERNS);
    email.addEventListener('input', searchHandler);
    email.addEventListener('focus', searchHandler);
    email.addEventListener('cut', searchHandler);
    email.addEventListener('blur', this.resetState);
  }

  render() {
    if (this.state.warnings.length > 0) {
      const parentNode = this.state.parentNode;
      const parentRect = parentNode.getBoundingClientRect();
      const warnings = this.state.warnings.map((warning, index) => (
        <Warning key={index} parentRect={parentRect} value={warning} />
      ));
      return ReactDOM.createPortal(warnings, parentNode);
    }
  }
}

export default JustNotSorry;
