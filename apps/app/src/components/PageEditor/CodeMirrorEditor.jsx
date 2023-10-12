import React, { useCallback, memo } from 'react';

import { commands } from 'codemirror';
import * as loadCssSync from 'load-css-file';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import * as loadScript from 'simple-load-script';
import { throttle, debounce } from 'throttle-debounce';
import urljoin from 'url-join';

import InterceptorManager from '~/services/interceptor-manager';
import {
  useHandsontableModal, useDrawioModal, useTemplateModal, useLinkEditModal,
} from '~/stores/modal';
import loggerFactory from '~/utils/logger';

import { UncontrolledCodeMirror } from '../UncontrolledCodeMirror';

import AbstractEditor from './AbstractEditor';
import { generateCMSOrLMSText } from './ChatGPTHelper';
import CommentMentionHelper from './CommentMentionHelper';
import EditorIcon from './EditorIcon';
import EmojiPicker from './EmojiPicker';
import EmojiPickerHelper from './EmojiPickerHelper';
import GridEditModal from './GridEditModal';
// TODO: re-impl with https://redmine.weseek.co.jp/issues/107248
// import geu from './GridEditorUtil';
import mdu from './MarkdownDrawioUtil';
import markdownLinkUtil from './MarkdownLinkUtil';
import markdownListUtil from './MarkdownListUtil';
import MarkdownTableInterceptor from './MarkdownTableInterceptor';
import mtu from './MarkdownTableUtil';
import pasteHelper from './PasteHelper';
import PreventMarkdownListInterceptor from './PreventMarkdownListInterceptor';
import SimpleCheatsheet from './SimpleCheatsheet';

import styles from './CodeMirrorEditor.module.scss';

require('codemirror/addon/hint/show-hint.css'); // Import from CodeMirrorEditor.module.scss not working
require('codemirror/addon/display/placeholder');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/matchtags');
require('codemirror/addon/edit/closetag');
require('codemirror/addon/edit/continuelist');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/search/searchcursor');
require('codemirror/addon/search/match-highlighter');
require('codemirror/addon/selection/active-line');
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/addon/scroll/scrollpastend');
require('codemirror/addon/fold/foldcode');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/markdown-fold');
require('codemirror/addon/fold/brace-fold');
require('codemirror/addon/display/placeholder');
require('~/client/util/codemirror/autorefresh.ext');
require('~/client/util/codemirror/drawio-fold.ext');
require('~/client/util/codemirror/gfm-growi.mode');
// import modes to highlight
require('codemirror/mode/clike/clike');
require('codemirror/mode/css/css');
require('codemirror/mode/django/django');
require('codemirror/mode/erlang/erlang');
require('codemirror/mode/gfm/gfm');
require('codemirror/mode/go/go');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/jsx/jsx');
require('codemirror/mode/mathematica/mathematica');
require('codemirror/mode/nginx/nginx');
require('codemirror/mode/perl/perl');
require('codemirror/mode/php/php');
require('codemirror/mode/python/python');
require('codemirror/mode/r/r');
require('codemirror/mode/ruby/ruby');
require('codemirror/mode/rust/rust');
require('codemirror/mode/sass/sass');
require('codemirror/mode/shell/shell');
require('codemirror/mode/sql/sql');
require('codemirror/mode/stex/stex');
require('codemirror/mode/stylus/stylus');
require('codemirror/mode/swift/swift');
require('codemirror/mode/toml/toml');
require('codemirror/mode/vb/vb');
require('codemirror/mode/vue/vue');
require('codemirror/mode/xml/xml');
require('codemirror/mode/yaml/yaml');


const MARKDOWN_TABLE_ACTIVATED_CLASS = 'markdown-table-activated';
const MARKDOWN_LINK_ACTIVATED_CLASS = 'markdown-link-activated';

class CodeMirrorEditor extends AbstractEditor {

  constructor(props) {
    super(props);
    this.logger = loggerFactory('growi:PageEditor:CodeMirrorEditor');

    this.state = {
      isGfmMode: this.props.isGfmMode,
      isLoadingKeymap: false,
      isSimpleCheatsheetShown: this.props.isGfmMode && this.props.value?.length === 0,
      isCheatsheetModalShown: false,
      additionalClassSet: new Set(),
      isEmojiPickerShown: false,
      emojiSearchText: '',
      startPosWithEmojiPickerModeTurnedOn: null,
      isEmojiPickerMode: false,
      isTemplateModalOpened: false,
    };

    this.cm = React.createRef();
    this.gridEditModal = React.createRef();
    this.linkEditModal = React.createRef();
    this.drawioModal = React.createRef();

    this.init();

    this.getCodeMirror = this.getCodeMirror.bind(this);

    this.getBol = this.getBol.bind(this);
    this.getEol = this.getEol.bind(this);

    this.loadTheme = this.loadTheme.bind(this);
    this.loadKeymapMode = this.loadKeymapMode.bind(this);
    this.setKeymapMode = this.setKeymapMode.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.handleCtrlEnterKey = this.handleCtrlEnterKey.bind(this);

    this.scrollCursorIntoViewHandler = this.scrollCursorIntoViewHandler.bind(this);
    this.scrollCursorIntoViewHandlerThrottled = throttle(500, this.scrollCursorIntoViewHandler);
    this.pasteHandler = this.pasteHandler.bind(this);
    this.cursorHandler = this.cursorHandler.bind(this);
    this.cursorHandlerDebounced = debounce(200, throttle(500, this.cursorHandler));
    this.changeHandler = this.changeHandler.bind(this);
    this.turnOnEmojiPickerMode = this.turnOnEmojiPickerMode.bind(this);
    this.turnOffEmojiPickerMode = this.turnOffEmojiPickerMode.bind(this);
    this.windowClickHandler = this.windowClickHandler.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.keyDownHandlerForEmojiPicker = this.keyDownHandlerForEmojiPicker.bind(this);
    this.keyDownHandlerForEmojiPickerThrottled = throttle(400, this.keyDownHandlerForEmojiPicker);
    this.showEmojiPicker = this.showEmojiPicker.bind(this);
    this.keyPressHandlerForEmojiPicker = this.keyPressHandlerForEmojiPicker.bind(this);
    this.keyPressHandlerForEmojiPickerThrottled = debounce(50, throttle(200, this.keyPressHandlerForEmojiPicker));
    this.keyPressHandler = this.keyPressHandler.bind(this);

    this.updateCheatsheetStates = this.updateCheatsheetStates.bind(this);

    this.renderLoadingKeymapOverlay = this.renderLoadingKeymapOverlay.bind(this);
    this.renderCheatsheetModalButton = this.renderCheatsheetModalButton.bind(this);

    this.makeHeaderHandler = this.makeHeaderHandler.bind(this);
    // TODO: re-impl with https://redmine.weseek.co.jp/issues/107248
    // this.showGridEditorHandler = this.showGridEditorHandler.bind(this);

    this.foldDrawioSection = this.foldDrawioSection.bind(this);
    this.clickDrawioIconHandler = this.clickDrawioIconHandler.bind(this);
    this.clickTableIconHandler = this.clickTableIconHandler.bind(this);

    this.showTemplateModal = this.showTemplateModal.bind(this);
    this.showLinkEditModal = this.showLinkEditModal.bind(this);

  }

  init() {
    this.cmCdnRoot = 'https://cdn.jsdelivr.net/npm/codemirror@5.42.0';
    this.cmNoCdnScriptRoot = '/static/js/cdn';
    this.cmNoCdnStyleRoot = '/static/styles/cdn';
    this.interceptorManager = new InterceptorManager();
    this.interceptorManager.addInterceptors([
      new PreventMarkdownListInterceptor(),
      new MarkdownTableInterceptor(),
    ]);

    this.loadedThemeSet = new Set(['eclipse', 'elegant']); // themes imported in _vendor.scss
    this.loadedKeymapSet = new Set();
  }

  componentDidMount() {
    // ensure to be able to resolve 'this' to use 'codemirror.commands.save'
    this.getCodeMirror().codeMirrorEditor = this;

    // mark clean
    this.getCodeMirror().getDoc().markClean();

    // fold drawio section
    this.foldDrawioSection();

    // initialize commentMentionHelper if comment editor is opened
    if (this.props.isComment) {
      this.commentMentionHelper = new CommentMentionHelper(this.getCodeMirror());
    }
    this.emojiPickerHelper = new EmojiPickerHelper(this.getCodeMirror());

    // HACKME: Find a better way to handle onClick for Editor
    document.addEventListener('click', this.windowClickHandler);
  }

  componentWillUnmount() {
    // HACKME: Find a better way to handle onClick for Editor
    document.removeEventListener('click', this.windowClickHandler);
  }

  componentWillReceiveProps(nextProps) {
    this.initializeEditorSettings(nextProps.editorSettings);

    // fold drawio section
    this.foldDrawioSection();
  }

  initializeEditorSettings(editorSettings) {
    if (editorSettings == null) {
      return;
    }

    // load theme
    const theme = editorSettings.theme;
    if (theme != null) {
      this.loadTheme(theme);
    }

    // set keymap
    const keymapMode = editorSettings.keymapMode;
    if (keymapMode != null) {
      this.setKeymapMode(keymapMode);
    }
  }

  getCodeMirror() {
    return this.cm.current?.editor;
  }

  /**
   * @inheritDoc
   */
  forceToFocus() {
    // use setInterval with reluctance -- 2018.01.11 Yuki Takei
    const intervalId = setInterval(() => {
      const editor = this.getCodeMirror();
      editor.focus();
      if (editor.hasFocus()) {
        clearInterval(intervalId);
        // refresh
        editor.refresh();
      }
    }, 100);
  }

  /**
   * @inheritDoc
   */
  setValue(newValue) {
    this.getCodeMirror().getDoc().setValue(newValue);

    // mark clean
    this.getCodeMirror().getDoc().markClean();
  }

  /**
   * @inheritDoc
   */
  setGfmMode(bool) {
    // update state
    this.setState({
      isGfmMode: bool,
    });

    this.updateCheatsheetStates(bool, null);

    // update CodeMirror option
    const mode = bool ? 'gfm' : undefined;
    this.getCodeMirror().setOption('mode', mode);
  }

  /**
   * @inheritDoc
   */
  setCaretLine(line) {
    if (Number.isNaN(line)) {
      return;
    }

    const editor = this.getCodeMirror();
    const linePosition = Math.max(0, line - 1);

    editor.setCursor({ line: linePosition }); // leave 'ch' field as null/undefined to indicate the end of line

    setTimeout(() => {
      this.setScrollTopByLine(linePosition);
    }, 100);
  }

  /**
   * @inheritDoc
   */
  setScrollTopByLine(line) {
    if (Number.isNaN(line)) {
      return;
    }

    const editor = this.getCodeMirror();
    // get top position of the line
    const top = editor.charCoords({ line: line - 1, ch: 0 }, 'local').top;
    editor.scrollTo(null, top);
  }

  /**
   * @inheritDoc
   */
  getStrFromBol() {
    const editor = this.getCodeMirror();
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(this.getBol(), curPos);
  }

  /**
   * @inheritDoc
   */
  getStrToEol() {
    const editor = this.getCodeMirror();
    const curPos = editor.getCursor();
    return editor.getDoc().getRange(curPos, this.getEol());
  }

  /**
   * @inheritDoc
   */
  getStrFromBolToSelectedUpperPos() {
    const editor = this.getCodeMirror();
    const pos = this.selectUpperPos(editor.getCursor('from'), editor.getCursor('to'));
    return editor.getDoc().getRange(this.getBol(), pos);
  }

  /**
   * @inheritDoc
   */
  replaceBolToCurrentPos(text) {
    const editor = this.getCodeMirror();
    const pos = this.selectLowerPos(editor.getCursor('from'), editor.getCursor('to'));
    editor.getDoc().replaceRange(text, this.getBol(), pos);
  }

  /**
   * @inheritDoc
   */
  replaceLine(text) {
    const editor = this.getCodeMirror();
    editor.getDoc().replaceRange(text, this.getBol(), this.getEol());
  }

  /**
   * @inheritDoc
   */
  insertText(text) {
    const editor = this.getCodeMirror();
    editor.getDoc().replaceSelection(text);
  }

  /**
   * return the postion of the BOL(beginning of line)
   */
  getBol() {
    const editor = this.getCodeMirror();
    const curPos = editor.getCursor();
    return { line: curPos.line, ch: 0 };
  }

  /**
   * return the postion of the EOL(end of line)
   */
  getEol() {
    const editor = this.getCodeMirror();
    const curPos = editor.getCursor();
    const lineLength = editor.getDoc().getLine(curPos.line).length;
    return { line: curPos.line, ch: lineLength };
  }

  /**
   * select the upper position of pos1 and pos2
   * @param {{line: number, ch: number}} pos1
   * @param {{line: number, ch: number}} pos2
   */
  selectUpperPos(pos1, pos2) {
    // if both is in same line
    if (pos1.line === pos2.line) {
      return (pos1.ch < pos2.ch) ? pos1 : pos2;
    }
    return (pos1.line < pos2.line) ? pos1 : pos2;
  }

  /**
   * select the lower position of pos1 and pos2
   * @param {{line: number, ch: number}} pos1
   * @param {{line: number, ch: number}} pos2
   */
  selectLowerPos(pos1, pos2) {
    // if both is in same line
    if (pos1.line === pos2.line) {
      return (pos1.ch < pos2.ch) ? pos2 : pos1;
    }
    return (pos1.line < pos2.line) ? pos2 : pos1;
  }

  loadCss(source) {
    return new Promise((resolve) => {
      loadCssSync(source);
      resolve();
    });
  }

  /**
   * load Theme
   * @see https://codemirror.net/doc/manual.html#config
   *
   * @param {string} theme
   */
  loadTheme(theme) {
    if (!this.loadedThemeSet.has(theme)) {
      const url = this.props.noCdn
        ? urljoin(this.cmNoCdnStyleRoot, `codemirror-theme-${theme}.css`)
        : urljoin(this.cmCdnRoot, `theme/${theme}.min.css`);

      this.loadCss(url);

      // update Set
      this.loadedThemeSet.add(theme);
    }
  }

  /**
   * load assets for Key Maps
   * @param {*} keymapMode 'default' or 'vim' or 'emacs' or 'sublime'
   */
  loadKeymapMode(keymapMode) {
    const loadCss = this.loadCss;
    const scriptList = [];
    const cssList = [];

    // add dependencies
    if (this.loadedKeymapSet.size === 0) {
      const dialogScriptUrl = this.props.noCdn
        ? urljoin(this.cmNoCdnScriptRoot, 'codemirror-dialog.js')
        : urljoin(this.cmCdnRoot, 'addon/dialog/dialog.min.js');
      const dialogStyleUrl = this.props.noCdn
        ? urljoin(this.cmNoCdnStyleRoot, 'codemirror-dialog.css')
        : urljoin(this.cmCdnRoot, 'addon/dialog/dialog.min.css');

      scriptList.push(loadScript(dialogScriptUrl));
      cssList.push(loadCss(dialogStyleUrl));
    }
    // load keymap
    if (!this.loadedKeymapSet.has(keymapMode)) {
      const keymapScriptUrl = this.props.noCdn
        ? urljoin(this.cmNoCdnScriptRoot, `codemirror-keymap-${keymapMode}.js`)
        : urljoin(this.cmCdnRoot, `keymap/${keymapMode}.min.js`);
      scriptList.push(loadScript(keymapScriptUrl));
      // update Set
      this.loadedKeymapSet.add(keymapMode);
    }

    // set loading state
    this.setState({ isLoadingKeymap: true });

    return Promise.all(scriptList.concat(cssList))
      .then(() => {
        this.setState({ isLoadingKeymap: false });
      });
  }

  /**
   * set Key Maps
   * @see https://codemirror.net/doc/manual.html#keymaps
   *
   * @param {string} keymapMode 'default' or 'vim' or 'emacs' or 'sublime'
   */
  setKeymapMode(keymapMode) {
    if (!keymapMode.match(/^(vim|emacs|sublime)$/)) {
      // reset
      this.getCodeMirror().setOption('keyMap', 'default');
      return;
    }

    this.loadKeymapMode(keymapMode)
      .then(() => {
        let errorCount = 0;
        const timer = setInterval(() => {
          if (errorCount > 10) { // cancel over 3000ms
            this.logger.error(`Timeout to load keyMap '${keymapMode}'`);
            clearInterval(timer);
          }

          try {
            this.getCodeMirror().setOption('keyMap', keymapMode);
            clearInterval(timer);
          }
          catch (e) {
            this.logger.info(`keyMap '${keymapMode}' has not been initialized. retry..`);

            // continue if error occured
            errorCount++;
          }
        }, 300);
      });
  }

  /**
   * handle ENTER key
   */
  handleEnterKey() {
    if (!this.state.isGfmMode) {
      commands.newlineAndIndent(this.getCodeMirror());
      return;
    }

    const context = {
      handlers: [], // list of handlers which process enter key
      editor: this,
      autoFormatMarkdownTable: this.props.editorSettings.autoFormatMarkdownTable,
    };

    const interceptorManager = this.interceptorManager;
    interceptorManager.process('preHandleEnter', context)
      .then(() => {
        if (context.handlers.length === 0) {
          markdownListUtil.newlineAndIndentContinueMarkdownList(this);
        }
      });
  }

  /**
   * handle Ctrl+ENTER key
   */
  handleCtrlEnterKey() {
    if (this.props.onCtrlEnter != null) {
      this.props.onCtrlEnter();
    }
  }

  scrollCursorIntoViewHandler(editor, event) {
    if (this.props.onScrollCursorIntoView != null) {
      const line = editor.getCursor().line;
      this.props.onScrollCursorIntoView(line);
    }
  }

  cursorHandler(editor, event) {
    const { additionalClassSet } = this.state;
    const hasCustomClass = additionalClassSet.has(MARKDOWN_TABLE_ACTIVATED_CLASS);
    const hasLinkClass = additionalClassSet.has(MARKDOWN_LINK_ACTIVATED_CLASS);

    const isInTable = mtu.isInTable(editor);
    const isInLink = markdownLinkUtil.isInLink(editor);

    if (!hasCustomClass && isInTable) {
      additionalClassSet.add(MARKDOWN_TABLE_ACTIVATED_CLASS);
      this.setState({ additionalClassSet });
    }

    if (hasCustomClass && !isInTable) {
      additionalClassSet.delete(MARKDOWN_TABLE_ACTIVATED_CLASS);
      this.setState({ additionalClassSet });
    }

    if (!hasLinkClass && isInLink) {
      additionalClassSet.add(MARKDOWN_LINK_ACTIVATED_CLASS);
      this.setState({ additionalClassSet });
    }

    if (hasLinkClass && !isInLink) {
      additionalClassSet.delete(MARKDOWN_LINK_ACTIVATED_CLASS);
      this.setState({ additionalClassSet });
    }
  }

  changeHandler(editor, data, value) {
    if (this.props.onChange != null) {
      const isClean = data.origin == null || editor.isClean() || value === this.props.value;
      this.props.onChange(value, isClean);
    }

    this.updateCheatsheetStates(null, value);

    // Show username hint on comment editor
    if (this.props.isComment) {
      this.commentMentionHelper.showUsernameHint();
    }

  }

  turnOnEmojiPickerMode(pos) {
    this.setState({
      isEmojiPickerMode: true,
      startPosWithEmojiPickerModeTurnedOn: pos,
    });
  }

  turnOffEmojiPickerMode() {
    this.setState({
      isEmojiPickerMode: false,
    });
  }

  showEmojiPicker(initialSearchingText) {
    // show emoji picker with a stored word
    this.setState({
      isEmojiPickerShown: true,
      emojiSearchText: initialSearchingText ?? '',
    });

    const resetStartPos = initialSearchingText == null;
    if (resetStartPos) {
      this.setState({ startPosWithEmojiPickerModeTurnedOn: null });
    }

    this.turnOffEmojiPickerMode();
  }

  keyPressHandlerForEmojiPicker(editor, event) {
    const char = event.key;
    const isEmojiPickerMode = this.state.isEmojiPickerMode;

    // evaluate whether emoji picker mode to be turned on
    if (!isEmojiPickerMode) {
      const startPos = this.emojiPickerHelper.shouldModeTurnOn(char);
      if (startPos == null) {
        return;
      }

      this.turnOnEmojiPickerMode(startPos);
      return;
    }

    // evaluate whether EmojiPicker to be opened
    const startPos = this.state.startPosWithEmojiPickerModeTurnedOn;
    if (this.emojiPickerHelper.shouldOpen(startPos)) {
      const initialSearchingText = this.emojiPickerHelper.getInitialSearchingText(startPos);
      this.showEmojiPicker(initialSearchingText);
      return;
    }

    this.turnOffEmojiPickerMode();
  }

  keyPressHandler(editor, event) {
    this.keyPressHandlerForEmojiPickerThrottled(editor, event);
  }

  keyDownHandlerForEmojiPicker(editor, event) {
    const key = event.key;

    if (!this.state.isEmojiPickerMode) {
      return;
    }

    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'BackSpace'].includes(key)) {
      this.turnOffEmojiPickerMode();
    }
  }

  keyDownHandler(editor, event) {
    this.keyDownHandlerForEmojiPickerThrottled(editor, event);
  }

  windowClickHandler() {
    this.turnOffEmojiPickerMode();
  }

  /**
   * CodeMirror paste event handler
   * see: https://codemirror.net/doc/manual.html#events
   * @param {any} editor An editor instance of CodeMirror
   * @param {any} event
   */
  pasteHandler(editor, event) {
    const types = event.clipboardData.types;

    // files
    if (types.includes('Files')) {
      event.preventDefault();
      this.dispatchPasteFiles(event);
    }
    // text
    else if (types.includes('text/plain')) {
      pasteHelper.pasteText(this, event);
    }

  }

  /**
   * update states which related to cheatsheet
   * @param {boolean} isGfmModeTmp (use state.isGfmMode if null is set)
   * @param {string} valueTmp (get value from codemirror if null is set)
   */
  updateCheatsheetStates(isGfmModeTmp, valueTmp) {
    const isGfmMode = isGfmModeTmp || this.state.isGfmMode;
    const value = valueTmp || this.getCodeMirror().getDoc().getValue();

    // update isSimpleCheatsheetShown
    const isSimpleCheatsheetShown = isGfmMode && value.length === 0;
    this.setState({ isSimpleCheatsheetShown });
  }

  markdownHelpButtonClickedHandler() {
    if (this.props.onMarkdownHelpButtonClicked != null) {
      this.props.onMarkdownHelpButtonClicked();
    }
  }

  renderLoadingKeymapOverlay() {
    // centering
    const style = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };

    return this.state.isLoadingKeymap
      ? (
        <div className="overlay overlay-loading-keymap">
          <span style={style} className="overlay-content">
            <div className="speeding-wheel d-inline-block"></div> Loading Keymap ...
          </span>
        </div>
      )
      : '';
  }

  renderCheatsheetModalButton() {
    return (
      <button type="button" className="btn-link gfm-cheatsheet-modal-link small" onClick={() => { this.markdownHelpButtonClickedHandler() }}>
        <i className="icon-question" /> Markdown
      </button>
    );
  }

  renderCheatsheetOverlay() {
    const cheatsheetModalButton = this.renderCheatsheetModalButton();

    return (
      <div className="overlay overlay-gfm-cheatsheet mt-1 p-3">
        { this.state.isSimpleCheatsheetShown
          ? (
            <div className="text-right">
              {cheatsheetModalButton}
              <div className="mb-2 d-none d-md-block">
                <SimpleCheatsheet />
              </div>
            </div>
          )
          : (
            <div className="mr-4 mb-2">
              {cheatsheetModalButton}
            </div>
          )
        }
      </div>
    );
  }

  renderEmojiPicker() {
    const { emojiSearchText } = this.state;
    return this.state.isEmojiPickerShown
      ? (
        <div className="text-left">
          <div className="mb-2 d-none d-md-block">
            <EmojiPicker
              onClose={() => this.setState({ isEmojiPickerShown: false })}
              onSelected={emoji => this.emojiPickerHelper.addEmoji(emoji, this.state.startPosWithEmojiPickerModeTurnedOn)}
              emojiSearchText={emojiSearchText}
              emojiPickerHelper={this.emojiPickerHelper}
              isOpen={this.state.isEmojiPickerShown}
            />
          </div>
        </div>
      )
      : '';
  }

  /**
   * return a function to replace a selected range with prefix + selection + suffix
   *
   * The cursor after replacing is inserted between the selection and the suffix.
   */
  createReplaceSelectionHandler(prefix, suffix) {
    return () => {
      const cm = this.getCodeMirror();
      const selection = cm.getDoc().getSelection();
      const curStartPos = cm.getCursor('from');
      const curEndPos = cm.getCursor('to');

      const curPosAfterReplacing = {};
      curPosAfterReplacing.line = curEndPos.line;
      if (curStartPos.line === curEndPos.line) {
        curPosAfterReplacing.ch = curEndPos.ch + prefix.length;
      }
      else {
        curPosAfterReplacing.ch = curEndPos.ch;
      }

      cm.getDoc().replaceSelection(prefix + selection + suffix);
      cm.setCursor(curPosAfterReplacing);
      cm.focus();
    };
  }

  /**
   * return a function to add prefix to selected each lines
   *
   * The cursor after editing is inserted between the end of the selection.
   */
  createAddPrefixToEachLinesHandler(prefix) {
    return () => {
      const cm = this.getCodeMirror();
      const startLineNum = cm.getCursor('from').line;
      const endLineNum = cm.getCursor('to').line;

      const lines = [];
      for (let i = startLineNum; i <= endLineNum; i++) {
        lines.push(prefix + cm.getDoc().getLine(i));
      }
      const replacement = `${lines.join('\n')}\n`;
      cm.getDoc().replaceRange(replacement, { line: startLineNum, ch: 0 }, { line: endLineNum + 1, ch: 0 });

      cm.setCursor(endLineNum, cm.getDoc().getLine(endLineNum).length);
      cm.focus();
    };
  }

  /**
   * make a selected line a header
   *
   * The cursor after editing is inserted between the end of the line.
   */
  makeHeaderHandler() {
    const cm = this.getCodeMirror();
    const lineNum = cm.getCursor('from').line;
    const line = cm.getDoc().getLine(lineNum);
    let prefix = '#';
    if (!line.startsWith('#')) {
      prefix += ' ';
    }
    cm.getDoc().replaceRange(prefix, { line: lineNum, ch: 0 }, { line: lineNum, ch: 0 });
    cm.focus();
  }

  // TODO: re-impl with https://redmine.weseek.co.jp/issues/107248
  // showGridEditorHandler() {
  //   this.gridEditModal.current.show(geu.getGridHtml(this.getCodeMirror()));
  // }

  showTemplateModal() {
    const onSubmit = templateText => this.insertText(templateText);
    this.props.onClickTemplateBtn({ onSubmit });
  }

  async renderChatGPTText() {
    const cm = this.getCodeMirror();
    const generatedText = await generateCMSOrLMSText(cm.getValue());

    if (generatedText != null) {
      cm.setValue(generatedText);
    }
  }

  showLinkEditModal() {
    const onSubmit = (linkText) => {
      return markdownLinkUtil.replaceFocusedMarkdownLinkWithEditor(this.getCodeMirror(), linkText);
    };

    const defaultMarkdownLink = markdownLinkUtil.getMarkdownLink(this.getCodeMirror());

    this.props.onClickLinkEditBtn(defaultMarkdownLink, onSubmit);
  }

  // fold draw.io section (``` drawio ~ ```)
  foldDrawioSection() {
    const editor = this.getCodeMirror();
    const lineNumbers = mdu.findAllDrawioSection(editor);
    lineNumbers.forEach((lineNumber) => {
      editor.foldCode({ line: lineNumber, ch: 0 }, { scanUp: false }, 'fold');
    });
  }

  clickDrawioIconHandler() {
    const drawioMxFile = mdu.getMarkdownDrawioMxfile(this.getCodeMirror());

    this.props.onClickDrawioBtn(
      drawioMxFile,
      // onSave
      (drawioMxFile) => {
        mdu.replaceFocusedDrawioWithEditor(this.getCodeMirror(), drawioMxFile);
        // Fold the section after the drawio section (```drawio) has been updated.
        this.foldDrawioSection();
      },
    );
  }

  clickTableIconHandler() {
    const markdownTable = mtu.getMarkdownTable(this.getCodeMirror());

    this.props.onClickTableBtn(
      markdownTable,
      this.getCodeMirror(),
      this.props.editorSettings.autoFormatMarkdownTable,
    );
  }

  getNavbarItems() {
    return [
      <Button
        key="nav-item-bold"
        color={null}
        size="sm"
        title="Bold"
        onClick={this.createReplaceSelectionHandler('**', '**')}
      >
        <EditorIcon icon="Bold" />
      </Button>,
      <Button
        key="nav-item-italic"
        color={null}
        size="sm"
        title="Italic"
        onClick={this.createReplaceSelectionHandler('*', '*')}
      >
        <EditorIcon icon="Italic" />
      </Button>,
      <Button
        key="nav-item-strikethrough"
        color={null}
        size="sm"
        title="Strikethrough"
        onClick={this.createReplaceSelectionHandler('~~', '~~')}
      >
        <EditorIcon icon="Strikethrough" />
      </Button>,
      <Button
        key="nav-item-header"
        color={null}
        size="sm"
        title="Heading"
        onClick={this.makeHeaderHandler}
      >
        <EditorIcon icon="Heading" />
      </Button>,
      <Button
        key="nav-item-code"
        color={null}
        size="sm"
        title="Inline Code"
        onClick={this.createReplaceSelectionHandler('`', '`')}
      >
        <EditorIcon icon="InlineCode" />
      </Button>,
      <Button
        key="nav-item-quote"
        color={null}
        size="sm"
        title="Quote"
        onClick={this.createAddPrefixToEachLinesHandler('> ')}
      >
        <EditorIcon icon="Quote" />
      </Button>,
      <Button
        key="nav-item-ul"
        color={null}
        size="sm"
        title="List"
        onClick={this.createAddPrefixToEachLinesHandler('- ')}
      >
        <EditorIcon icon="List" />
      </Button>,
      <Button
        key="nav-item-ol"
        color={null}
        size="sm"
        title="Numbered List"
        onClick={this.createAddPrefixToEachLinesHandler('1. ')}
      >
        <EditorIcon icon="NumberedList" />
      </Button>,
      <Button
        key="nav-item-checkbox"
        color={null}
        size="sm"
        title="Check List"
        onClick={this.createAddPrefixToEachLinesHandler('- [ ] ')}
      >
        <EditorIcon icon="CheckList" />
      </Button>,
      <Button
        key="nav-item-attachment"
        color={null}
        size="sm"
        title="Attachment"
        onClick={this.props.onAddAttachmentButtonClicked}
      >
        <EditorIcon icon="Attachment" />
      </Button>,
      <Button
        key="nav-item-link"
        color={null}
        size="sm"
        title="Link"
        onClick={this.showLinkEditModal}
      >
        <EditorIcon icon="Link" />
      </Button>,
      <Button
        key="nav-item-image"
        color={null}
        size="sm"
        title="Image"
        onClick={this.createReplaceSelectionHandler('![', ']()')}
      >
        <EditorIcon icon="Image" />
      </Button>,
      // TODO: re-impl with https://redmine.weseek.co.jp/issues/107248
      // <Button
      //   key="nav-item-grid"
      //   color={null}
      //   size="sm"
      //   title="Grid"
      //   onClick={this.showGridEditorHandler}
      // >
      //   <EditorIcon icon="Grid" />
      // </Button>,
      <Button
        key="nav-item-table"
        color={null}
        size="sm"
        title="Table"
        onClick={this.clickTableIconHandler}
      >
        <EditorIcon icon="Table" />
      </Button>,
      <Button
        key="nav-item-drawio"
        color={null}
        bssize="small"
        title="draw.io"
        onClick={this.clickDrawioIconHandler}
      >
        <EditorIcon icon="Drawio" />
      </Button>,
      <Button
        key="nav-item-emoji"
        color={null}
        bssize="small"
        title="Emoji"
        onClick={() => this.showEmojiPicker()}
      >
        <EditorIcon icon="Emoji" />
      </Button>,
      <Button
        key="nav-item-template"
        color={null}
        bssize="small"
        title="Template"
        onClick={() => this.showTemplateModal()}
      >
        <EditorIcon icon="Template" />
      </Button>,
      <Button
        key="nav-item-template"
        color={null}
        bssize="small"
        title="ChatGPT"
        onClick={() => this.renderChatGPTText()}
      >
        <EditorIcon icon="ChatGPT" />
      </Button>,
    ];
  }


  render() {
    const additionalClasses = Array.from(this.state.additionalClassSet).join(' ');
    const placeholder = this.state.isGfmMode ? 'Input with Markdown..' : 'Input with Plain Text..';

    const gutters = [];
    if (this.props.lineNumbers != null) {
      gutters.push('CodeMirror-linenumbers', 'CodeMirror-foldgutter');
    }

    return (
      <div className={`grw-codemirror-editor ${styles['grw-codemirror-editor']}`}>

        <UncontrolledCodeMirror
          ref={this.cm}
          className={additionalClasses}
          placeholder="search"
          value={this.props.value}
          options={{
            indentUnit: this.props.indentSize,
            theme: this.props.editorSettings.theme ?? 'elegant',
            styleActiveLine: this.props.editorSettings.styleActiveLine,
            lineWrapping: true,
            scrollPastEnd: true,
            autoRefresh: { force: true }, // force option is enabled by autorefresh.ext.js -- Yuki Takei
            autoCloseTags: true,
            placeholder,
            matchBrackets: true,
            emoji: true,
            matchTags: { bothTags: true },
            // folding
            foldGutter: this.props.lineNumbers,
            gutters,
            // match-highlighter, matchesonscrollbar, annotatescrollbar options
            highlightSelectionMatches: { annotateScrollbar: true },
            // continuelist, indentlist
            extraKeys: {
              Enter: this.handleEnterKey,
              'Ctrl-Enter': this.handleCtrlEnterKey,
              'Cmd-Enter': this.handleCtrlEnterKey,
              Tab: 'indentMore',
              'Shift-Tab': 'indentLess',
              'Ctrl-Q': (cm) => { cm.foldCode(cm.getCursor()) },
            },
          }}
          onCursor={this.cursorHandlerDebounced}
          onScroll={(editor, data) => {
            if (this.props.onScroll != null) {
            // add line data
              const line = editor.lineAtHeight(data.top, 'local');
              data.line = line;
              this.props.onScroll(data);
            }
          }}
          onChange={this.changeHandler}
          onDragEnter={(editor, event) => {
            if (this.props.onDragEnter != null) {
              this.props.onDragEnter(event);
            }
          }}
          onKeyPress={this.keyPressHandler}
          onKeyDown={this.keyDownHandler}
          onPasteFiles={this.pasteHandler}
          onScrollCursorIntoView={this.scrollCursorIntoViewHandlerThrottled}
        />

        { this.renderLoadingKeymapOverlay() }

        { this.renderCheatsheetOverlay() }
        { this.renderEmojiPicker() }

        {/*
        // TODO: re-impl with https://redmine.weseek.co.jp/issues/107248
        <GridEditModal
          ref={this.gridEditModal}
          onSave={(grid) => { return geu.replaceGridWithHtmlWithEditor(this.getCodeMirror(), grid) }}
        />
         */}
      </div>
    );
  }

}

CodeMirrorEditor.propTypes = Object.assign({
  lineNumbers: PropTypes.bool,
  editorSettings: PropTypes.object.isRequired,
  onMarkdownHelpButtonClicked: PropTypes.func,
  onAddAttachmentButtonClicked: PropTypes.func,
}, AbstractEditor.propTypes);

CodeMirrorEditor.defaultProps = {
  lineNumbers: true,
};

const CodeMirrorEditorMemoized = memo(CodeMirrorEditor);


const CodeMirrorEditorFc = React.forwardRef((props, ref) => {
  const { open: openDrawioModal } = useDrawioModal();
  const { open: openHandsontableModal } = useHandsontableModal();
  const { open: openTemplateModal } = useTemplateModal();
  const { open: openLinkEditModal } = useLinkEditModal();

  const openDrawioModalHandler = useCallback((drawioMxFile, onSave) => {
    openDrawioModal(drawioMxFile, onSave);
  }, [openDrawioModal]);

  const openTableModalHandler = useCallback((markdownTable, editor, autoFormatMarkdownTable) => {
    openHandsontableModal(markdownTable, editor, autoFormatMarkdownTable);
  }, [openHandsontableModal]);

  const openTemplateModalHandler = useCallback((onSubmit) => {
    openTemplateModal(onSubmit);
  }, [openTemplateModal]);

  const openLinkEditModalHandler = useCallback((defaultMarkdownLink, onSubmit) => {
    openLinkEditModal(defaultMarkdownLink, onSubmit);
  }, [openLinkEditModal]);

  return (
    <CodeMirrorEditorMemoized
      ref={ref}
      onClickDrawioBtn={openDrawioModalHandler}
      onClickTableBtn={openTableModalHandler}
      onClickTemplateBtn={openTemplateModalHandler}
      onClickLinkEditBtn={openLinkEditModalHandler}
      {...props}
    />
  );
});

CodeMirrorEditorFc.displayName = 'CodeMirrorEditorFc';

export default memo(CodeMirrorEditorFc);
