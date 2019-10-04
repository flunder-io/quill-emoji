import Quill from 'quill';
import Fuse from 'fuse.js';
import emojiList from './emoji-list.js';

const Delta = Quill.import('delta');
const Module = Quill.import('core/module');

class ToolbarEmoji extends Module {
  constructor(quill, options) {
    super(quill, options);

    this.quill = quill;
    this.toolbar = quill.getModule('toolbar');
    if (typeof this.toolbar !== 'undefined')
      this.toolbar.addHandler('emoji', this.checkPalatteExist);

    var emojiBtns = document.getElementsByClassName('ql-emoji');
    if (emojiBtns) {
      [].slice.call( emojiBtns ).forEach(function ( emojiBtn ) {
        emojiBtn.innerHTML = options.buttonIcon;
      });
    }
  }

  checkPalatteExist() {
    let quill = this.quill;
    fn_checkDialogOpen(quill);
    this.quill.on('text-change', function(delta, oldDelta, source) {
      if (source === 'user') {
        fn_close();
        fn_updateRange(quill);
      }
    });
  }
}

ToolbarEmoji.DEFAULTS = {
  buttonIcon: '<svg viewbox="0 0 18 18"><circle class="ql-fill" cx="7" cy="7" r="1"></circle><circle class="ql-fill" cx="11" cy="7" r="1"></circle><path class="ql-stroke" d="M7,10a2,2,0,0,0,4,0H7Z"></path><circle class="ql-stroke" cx="9" cy="9" r="6"></circle></svg>'
};

function fn_close(){
  let ele_emoji_plate = document.getElementById('emoji-palette');
  if (ele_emoji_plate) {ele_emoji_plate.remove()}
}

function fn_checkDialogOpen(quill){
  let elementExists = document.getElementById("emoji-palette");
  if (elementExists) {
    elementExists.remove();
  }
  else{
    fn_showEmojiPalatte(quill);
  }
}

function fn_updateRange(quill){
  let range = quill.getSelection();
  return range;
}

function fn_clamp(x, [min, max]) {
    if (x < min) {
        return min
    }
    if (x > max) {
        return max
    }
    return x
}

function fn_showEmojiPalatte(quill) {
  let range = quill.getSelection();
  const cursor_rect = quill.getBounds(range.index);
  const palette_max_left = quill.container.offsetWidth - 250; //palette max width is 250
  const palette_left = fn_clamp(Math.ceil(cursor_rect.left), [0, palette_max_left]);
  const palette_top =  Math.ceil(cursor_rect.top + cursor_rect.height + 10);

  let palette = document.createElement('div');
  palette.id = 'emoji-palette';
  palette.style.left = palette_left + "px";
  palette.style.top = palette_top + "px";
  quill.container.appendChild(palette);

  let tabToolbar = document.createElement('div');
  tabToolbar.id="tab-toolbar";
  palette.appendChild(tabToolbar);

  //panel
  let panel = document.createElement('div');
  panel.id="tab-panel";
  palette.appendChild(panel);

  var emojiType = [
    {'type':'p','name':'people','content':'<div class="i-people"></div>'},
    {'type':'n','name':'nature','content':'<div class="i-nature"></div>'},
    {'type':'d','name':'food','content':'<div class="i-food"></div>'},
    {'type':'s','name':'symbols','content':'<div class="i-symbols"></div>'},
    {'type':'a','name':'activity','content':'<div class="i-activity"></div>'},
    {'type':'t','name':'travel','content':'<div class="i-travel"></div>'},
    {'type':'o','name':'objects','content':'<div class="i-objects"></div>'},
    {'type':'f','name':'flags','content':'<div class="i-flags"></div>'}
  ];

  let tabElementHolder = document.createElement('ul');
  tabToolbar.appendChild(tabElementHolder);

  emojiType.map(function(emojiType) {
    //add tab bar
    let tabElement = document.createElement('li');
    tabElement.classList.add('emoji-tab');
    tabElement.classList.add('filter-'+emojiType.name);
    let tabValue = emojiType.content;
    tabElement.innerHTML = tabValue;
    tabElement.dataset.filter = emojiType.type;
    tabElementHolder.appendChild(tabElement);

    let emojiFilter = document.querySelector('.filter-'+emojiType.name);
    emojiFilter.addEventListener('click',function(){
      let tab = document.querySelector('.active');
      if (tab) {
        tab.classList.remove('active');
      }
      emojiFilter.classList.toggle('active');
      fn_updateEmojiContainer(emojiFilter,panel,quill);
    })
  });
  fn_emojiPanelInit(panel,quill);

  requestAnimationFrame(() => {
    const palette_height = palette.offsetHeight;
    const min_editor_height = palette_top + palette_height;
    const editor_height = quill.container.offsetHeight;
    if (editor_height < min_editor_height) {
      const alt_palette_top = Math.floor(cursor_rect.top - (palette_height + 10));
      if (alt_palette_top >= 0) {
        // Display the palette above the cursor ...
        palette.style.top = alt_palette_top + "px";
      } else {
        // Enlarge the editor, so that the palette is fully visible ...
        quill.container.style.minHeight = min_editor_height + "px";
      }
    }
  })
}

function fn_emojiPanelInit(panel,quill){
  fn_emojiElementsToPanel('p', panel, quill);
  document.querySelector('.filter-people').classList.add('active');
}

function fn_emojiElementsToPanel(type,panel,quill){
  let fuseOptions = {
    shouldSort: true,
    matchAllTokens: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 3,
    keys: [
      "category"
    ]
  };
  let fuse = new Fuse(emojiList, fuseOptions);
  let result = fuse.search(type);
  result.sort(function (a, b) {
    return a.emoji_order - b.emoji_order;
  });

  quill.focus();
  let range = fn_updateRange(quill);

  result.map(function(emoji) {
    let span = document.createElement('span');
    let t = document.createTextNode(emoji.shortname);
    span.appendChild(t);
    span.classList.add('bem');
    span.classList.add('bem-' + emoji.name);
    span.classList.add('ap');
    span.classList.add('ap-' + emoji.name);
    let output = '' + emoji.code_decimal + '';
    span.innerHTML = output + ' ';
    panel.appendChild(span);

    let customButton = document.querySelector('.bem-' + emoji.name);
    if (customButton) {
      customButton.addEventListener('click', function() {
        let emoji_icon_html =makeElement("span", {className: "ico", innerHTML: ''+emoji.code_decimal+' ' });
        let emoji_icon = emoji_icon_html.innerHTML;
        quill.insertEmbed(range.index, 'emoji', emoji, Quill.sources.USER);
        setTimeout(() => quill.setSelection(range.index + 1), 0);
        fn_close();
      });
    }
  });
}

function fn_updateEmojiContainer(emojiFilter,panel,quill){
  while (panel.firstChild) {
    panel.removeChild(panel.firstChild);
  }
  let type = emojiFilter.dataset.filter;
  fn_emojiElementsToPanel(type,panel,quill);
}

function makeElement(tag, attrs, ...children) {
  const elem = document.createElement(tag);
  Object.keys(attrs).forEach(key => elem[key] = attrs[key]);
  children.forEach(child => {
    if (typeof child === "string")
      child = document.createTextNode(child);
    elem.appendChild(child);
  });
  return elem;
}

export default ToolbarEmoji;
