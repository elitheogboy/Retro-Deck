'use strict';
const byId = id => document.getElementById(id);
const list = byId('games');
const search = byId('query');
const dialog = byId('detail');
const filters = ['All games', 'Volume 1', 'Volume 2', 'Star Dash Edition', 'Originals'];
let all = [];
let filter = filters[0];

function label(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function render() {
  const q = search.value.trim().toLowerCase();
  const games = all.filter(game => {
    const inFilter = filter === filters[0] || (filter === 'Originals' ? game.homebrew : game.packs.includes(filter));
    return inFilter && [game.title, game.genre, game.publisher, game.year].some(value => value.toLowerCase().includes(q));
  });
  byId('count').textContent = games.length + (games.length === 1 ? ' game' : ' games');
  const items = document.createDocumentFragment();
  for (const game of games) {
    const row = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.append(label('span', game.homebrew ? 'NEW' : 'NES', 'chip'), label('span', game.title, 'gamename'), label('span', '›', 'arrow'));
    btn.onclick = () => openDetails(game);
    row.append(btn);
    items.append(row);
  }
  list.replaceChildren(items);
  byId('empty').textContent = 'No games match your search.';
  byId('empty').hidden = games.length > 0;
}

function openDetails(game) {
  byId('game-type').textContent = game.homebrew ? 'RETRO DECK ORIGINAL' : 'NINTENDO ENTERTAINMENT SYSTEM';
  byId('game-title').textContent = game.title;
  byId('description').textContent = game.description;
  const facts = byId('facts');
  facts.replaceChildren();
  for (const [title, value] of [['Genre', game.genre], ['Release', game.year], ['Publisher', game.publisher], ['Players', game.players], ['Collection', game.packs.join(' · ')]]) {
    if (!value) continue;
    const fact = document.createElement('div');
    fact.append(label('dt', title), label('dd', value));
    facts.append(fact);
  }
  const download = byId('download');
  download.href = 'games/' + encodeURIComponent(game.download);
  download.download = game.filename;
  byId('size').textContent = Math.ceil(game.size / 1024) + ' KB';
  const reference = byId('reference');
  reference.hidden = !game.reference;
  if (game.reference) reference.href = game.reference;
  else reference.removeAttribute('href');
  dialog.showModal();
}
for (const name of filters) {
  const button = label('button', name);
  button.type = 'button';
  button.setAttribute('aria-pressed', name === filter);
  button.onclick = () => {
    filter = name;
    for (const sibling of byId('filters').children) sibling.setAttribute('aria-pressed', sibling === button);
    render();
  };
  byId('filters').append(button);
}
search.oninput = render;
byId('close').onclick = () => dialog.close();
fetch('catalog.json').then(response => {
  if (!response.ok) throw new Error('Catalog unavailable');
  return response.json();
}).then(games => {
  all = games;
  render();
}).catch(() => {
  byId('empty').hidden = false;
  byId('empty').textContent = 'The game catalog could not load. Refresh to try again.';
});
