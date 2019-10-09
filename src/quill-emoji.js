import Quill from 'quill';
import emojiList from "./emoji-list";
import EmojiBlot from './format-emoji-blot';
import ShortNameEmoji from './module-emoji';
import ToolbarEmoji from './module-toolbar-emoji';
import TextAreaEmoji from './module-textarea-emoji';
import './scss/quill-emoji.scss';

Quill.register({
    'formats/emoji': EmojiBlot,
    'modules/emoji-shortname': ShortNameEmoji,
    'modules/emoji-toolbar': ToolbarEmoji,
    'modules/emoji-textarea': TextAreaEmoji
  }, true);  

export { EmojiBlot, ShortNameEmoji, ToolbarEmoji, TextAreaEmoji, emojiList };