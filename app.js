import { Chess } from 'chess.js';

const $ = (s) => document.querySelector(s);
const boardEl = $('#board');
const game = new Chess();
const pieceGlyph = { wk:'♔', wq:'♕', wr:'♖', wb:'♗', wn:'♘', wp:'♙', bk:'♚', bq:'♛', br:'♜', bb:'♝', bn:'♞', bp:'♟' };
const files = 'abcdefgh';
const phrases = {
  intro: ['Ну что, усаживайся. Я обещаю не поддаваться. Ты — обещать ничего не должен, я и так всё вижу.', 'Добро пожаловать. Доска чистая, репутация — пока тоже. Посмотрим, что продержится дольше.', 'Начинаем. Не переживай: первые ошибки я обычно замечаю молча. Обычно.'],
  normal: ['Интересно. Не уверен, что хорошо, но интересно.', 'Ход принят. Даже часы удивились, что ты сделал это так быстро.', 'Ладно, признаю: у этой идеи есть хотя бы форма.', 'Ты что-то задумал. Надеюсь, сам знаешь что.', 'Ход сделан. Доска всё помнит, кстати.'],
  good: ['Ох, это уже похоже на шахматы. Не привыкай к похвале.', 'Хорошо сыграно. Я бы даже сказал — неприятно хорошо.', 'Вот это ход! Ладно, признаю, ты меня удивил.', 'Неплохо. На секунду я даже перестал язвить. Почти.'],
  bad: ['Ты вообще думаешь, когда ходишь, или фигуры сами по себе живут?', 'Щедро. Ещё и без упаковки мне фигуру подарил.', 'Это был план или доска чихнула?', 'Так, спокойно. Это точно был твой ход?'],
  capture: ['Съел фигуру. Вкусно? Не увлекайся, тут иногда дают сдачи.', 'Забрал материал — и даже не спросил разрешения. Смело.', 'Размен состоялся. Кто-то сейчас делает вид, что так и хотел.'],
  check: ['Шах! Ну наконец-то кто-то здесь задаёт вопросы.', 'Шах. Вот теперь у меня испортилось настроение.', 'О, шах. Ты всё-таки знаешь, где у меня король.'],
  swearBad: ['Твою мать, ты только что подарил мне фигуру! Спасибо, конечно!', 'Блядь, это не жертва, это доставка на дом.', 'Ну ты и выдал, ё-моё. Король твой уже пишет заявление о смене владельца.', 'Вот это просчёт, чёрт побери. Даже я не ожидал такого подарка.'],
  swearGood: ['Охренеть! Вот это ход! Ладно, признаю, ты меня удивил!', 'Да чтоб тебя — красиво сыграно. Мне даже ругаться не на что.', 'Вот это жертва, мать её. Ладно, сегодня ты опасен.', 'Блядь, хорошая тактика. Откуда ты это выкопал?'],
  aiCapture: ['Блядь! Вот этого ты не заметил? Забираю. Спасибо.', 'Опа, фигура сама в руки пришла. Я даже не буду спрашивать.', 'А вот это уже неприятно для тебя. Забираю добычу.'],
  win: ['Ну всё, приехали. Сегодня ты действительно заслужил победу. Чёрт побери!', 'Мат. Ладно, красиво. Наслаждайся, такие дни бывают нечасто.', 'Победа твоя. Запомни этот момент — я уже делаю вид, что так и планировал.'],
  lose: ['Спасибо за партию. Надеюсь, ты хотя бы получил удовольствие от этого шахматного разгрома!', 'Мат. Король лёг, достоинство — чуть раньше.', 'Победа за мной. Не переживай, реванш — это ещё один шанс всё испортить.'],
  draw: ['Ничья. Никто не победил, зато оба можем рассказать, что почти выиграли.', 'Пат. Даже доска устала выбирать, кто из нас хуже.', 'Ничья. Достойный компромисс между нашими амбициями.']
};
const swearByLevel = {
  1: { bad:['Чёрт, это была фигура. Ты точно хотел её отдать?','Ну и щедрость. Лёгкий промах, но неприятный.'], good:['Вот это ход, чёрт возьми!','Неплохо. Даже мой внутренний критик кивнул.'], capture:['Забрал фигуру. Вот это поворот, чёрт побери.'] },
  2: { bad:phrases.swearBad, good:phrases.swearGood, capture:phrases.aiCapture },
  3: { bad:['Твою мать, ты только что подарил мне ферзя! Это шахматы или благотворительный фонд для коней?!','Блядь, такая зевота, что даже мои фигуры хотят закрыть глаза.','Ты это всерьёз сыграл? Ферзь ушёл, мозг тоже решил взять выходной?'], good:['Охренеть, какой ход! Я бы сейчас выругался, но это будет комплимент.','Блядь, красиво. Ты только что заставил меня уважать тебя, а это ужасно неудобно.','Вот это жертва, мать её! Доска горит, мой план дымится — продолжай!'], capture:['Блядь! Фигура в кармане. Ты сам её туда положил, я свидетель.','Опа, подарок приехал. Упаковка не нужна, я и так в восторге.'] }
};
let selected = null, legalTargets = [], lastMove = null, pendingPromotion = null;
let engine = null, engineReady = false, engineBusy = false, bestMove = null, engineEval = 0, lastEval = null;
let mode = 'ai', aiThinking = false, gameEnded = false, puzzleSolved = false, terminalLabel = '', gameNumber = 1, muted = false, soundEnabled = true, profanity = false, profanityLevel = 2;
let voices = [], lastComment = phrases.intro[0], toastTimer = null, blitz = false, playerSeconds = 180, aiSeconds = 180, clockTimer = null;
const depthForLevel = {1:9, 2:12, 3:15, 4:18};

function initEngine(){
  try{
    const source = `importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');`;
    engine = new Worker(URL.createObjectURL(new Blob([source], {type:'application/javascript'})));
    engine.onmessage = (e) => {
      const line = String(e.data || '');
      if(line === 'uciok'){ engine.postMessage('setoption name Skill Level value 20'); engine.postMessage('isready'); }
      if(line === 'readyok'){ engineReady = true; engineBusy = false; $('#engine-state').textContent='ГОТОВ'; $('#footer-status').textContent='ГОТОВ'; }
      const info = line.match(/\bscore cp (-?\d+)/);
      if(info) engineEval = Number(info[1])/100;
      const mate = line.match(/\bscore mate (-?\d+)/);
      if(mate) engineEval = Number(mate[1])>0?99:-99;
      const bm = line.match(/^bestmove\s+(\S+)/);
      if(bm){ bestMove = bm[1]; engineBusy = false; if(aiThinking) playEngineMove(bestMove); }
    };
    engine.onerror = () => { engineReady=false; $('#engine-state').textContent='РЕЗЕРВ'; $('#footer-status').textContent='РЕЗЕРВНЫЙ РЕЖИМ'; };
    engine.postMessage('uci');
  }catch(e){ $('#engine-state').textContent='РЕЗЕРВ'; $('#footer-status').textContent='РЕЗЕРВНЫЙ РЕЖИМ'; }
}
function startEngineSearch(){
  if(!engineReady || !engine) return false;
  bestMove=null; engineBusy=true;
  const skill = Number($('#difficulty').value);
  engine.postMessage(`setoption name Skill Level value ${[3,8,14,20][skill-1]}`);
  engine.postMessage(`position fen ${game.fen()}`);
  engine.postMessage(`go depth ${depthForLevel[skill]}`);
  return true;
}
function renderBoard(){
  const orientBlack = boardEl.dataset.flipped === 'true';
  const board = game.board();
  const squares = [];
  for(let row=0; row<8; row++) for(let col=0; col<8; col++){
    const rank = orientBlack ? row+1 : 8-row;
    const file = orientBlack ? 7-col : col;
    const sq = files[file]+rank;
    const piece = board[8-rank][file];
    const cell = document.createElement('button'); cell.type='button'; cell.className='square '+((rank+file)%2?'dark':'light'); cell.dataset.square=sq; cell.setAttribute('role','gridcell'); cell.setAttribute('aria-label',`${sq}${piece?` ${piece.color==='w'?'белая':'чёрная'} ${piece.type}`:''}`);
    if(lastMove && (lastMove.from===sq || lastMove.to===sq)) cell.classList.add('last-move');
    if(selected===sq) cell.classList.add('selected');
    if(game.isCheck() && piece?.type==='k' && piece.color===game.turn()) cell.classList.add('check-square');
    if(piece){const span=document.createElement('span');span.className=`piece ${piece.color==='w'?'white':'black'}`;span.textContent=pieceGlyph[piece.color+piece.type];cell.append(span);}
    if(legalTargets.includes(sq)){const dot=document.createElement('span');dot.className='legal-dot';cell.append(dot);}
    if((!orientBlack&&file===0)||(orientBlack&&file===7)){const rankLabel=document.createElement('span');rankLabel.className='coord rank';rankLabel.textContent=rank;cell.append(rankLabel);}
    if((!orientBlack&&rank===1)||(orientBlack&&rank===8)){const fileLabel=document.createElement('span');fileLabel.className='coord file';fileLabel.textContent=files[file];cell.append(fileLabel);}
    cell.addEventListener('click',()=>onSquare(sq)); squares.push(cell);
  }
  boardEl.replaceChildren(...squares);
  $('#turn-status').textContent = gameEnded ? resultLabel() : game.isGameOver() ? resultLabel() : (game.turn()==='w'?'Твой ход. Не облажайся.':mode==='local'||mode==='analysis'?'Ход чёрных.':'Гарри думает…');
  renderMoves(); updateClocks();
}
function onSquare(sq){
  if(gameEnded || puzzleSolved || game.isGameOver() || aiThinking || (!['local','analysis'].includes(mode) && game.turn()==='b')) return;
  const piece=game.get(sq);
  if(selected && legalTargets.includes(sq)){
    const moves=game.moves({square:selected,verbose:true});
    const candidate=moves.find(m=>m.to===sq);
    if(candidate?.flags.includes('p')){pendingPromotion={from:selected,to:sq};$('#promotion-modal').classList.remove('hidden');return;}
    makeMove({from:selected,to:sq});return;
  }
  if(piece && piece.color===game.turn()){
    selected=sq;legalTargets=game.moves({square:sq,verbose:true}).map(m=>m.to);
  }else{selected=null;legalTargets=[];}
  renderBoard();
}
function makeMove(move){
  if(gameEnded||puzzleSolved)return;
  const before=game.fen();
  try{
    const result=game.move(move);
    if(!result) return;
    selected=null;legalTargets=[];lastMove={from:result.from,to:result.to};renderBoard();
    if(mode==='puzzle'){handlePuzzleMove(result);return;}
    commentForMove(result);
    if(['local','analysis'].includes(mode)){
      if(game.isGameOver()) finishGame();
    }else if(game.turn()==='b' && !game.isGameOver()){
      aiThinking=true; $('#turn-status').textContent='Гарри анализирует позицию…';
      const started=startEngineSearch();
      if(!started) setTimeout(()=>fallbackMove(),400);
    }else if(game.isGameOver()) finishGame();
  }catch(err){game.load(before);}
}
function playEngineMove(uci){
  if(!aiThinking)return;
  if(!uci || uci==='(none)'){fallbackMove();return;}
  try{
    const move=game.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]||'q'});
    if(!move){fallbackMove();return;}
    aiThinking=false;lastMove={from:move.from,to:move.to};selected=null;legalTargets=[];renderBoard();
    if(mode!=='local') commentForMove(move,true);
    if(game.isGameOver())finishGame();
  }catch(e){aiThinking=false;fallbackMove();}
}
function fallbackMove(){
  aiThinking=false;
  const moves=game.moves({verbose:true}); if(!moves.length)return;
  // Legal-move fallback with a material-aware one-ply score; the full Stockfish engine is preferred.
  const values={p:100,n:320,b:330,r:500,q:900,k:0};
  const ranked=moves.map(m=>{let score=(m.captured?values[m.captured]*1.15:0)+(m.promotion?800:0)+(m.san.includes('+')?55:0)+Math.random()*14;return [m,score];}).sort((a,b)=>b[1]-a[1]);
  const chosen=ranked[Math.min(ranked.length-1,Math.floor(Math.random()*Math.min(3,ranked.length)))][0];
  const move=game.move({from:chosen.from,to:chosen.to,promotion:chosen.promotion||'q'});lastMove={from:move.from,to:move.to};renderBoard();commentForMove(move,true);if(game.isGameOver())finishGame();
}
function commentForMove(move, isAI=false){
  const level=profanityLevel;
  let category='normal', tag='ХОД СДЕЛАН';
  if(game.isCheckmate()){category=isAI?'lose':'win';tag='МАТ';}
  else if(game.isDraw()){category='draw';tag='НИЧЬЯ';}
  else if(move.san.includes('+')){category='check';tag='ШАХ';}
  else if(move.captured){category=isAI?'aiCapture':'capture';tag='ВЗЯТИЕ';}
  else if(!isAI && Math.random()<.22){category='bad';tag='СОМНИТЕЛЬНО';}
  else if(!isAI && Math.random()<.18){category='good';tag='КРАСИВЫЙ ХОД';}
  let text;
  const forceSwear=profanity||mode==='uncensored';
  if(forceSwear && (category==='bad'||category==='good'||category==='capture'||category==='aiCapture')){
    let key=category==='aiCapture'?'capture':category;
    const list=swearByLevel[level]?.[key]; if(list) text=pick(list);
  }
  if(!text) text=pick(phrases[category]||phrases.normal);
  if(mode==='learn' && !isAI) text=learnText(move);
  showComment(tag,text,true);
}
function pick(list){return list[Math.floor(Math.random()*list.length)];}
function showComment(tag,text,speak=false){
  lastComment=text;$('#comment-text').textContent=text;$('#comment-tag').textContent=tag;const meta=$('.comment-tag');if(meta)meta.textContent=tag;
  const time=$('.comment-meta time');if(time)time.textContent='СЕЙЧАС';
  const count=$('#comment-count');count.textContent=String(Number(count.textContent||0)+1);
  if(speak) say(text);
}
function learnText(move){
  if(move.san.includes('#'))return 'Шах и мат! Король противника не может уйти от атаки — партия окончена.';
  if(move.san.includes('+'))return 'Шах: король под ударом. Соперник обязан снять шах, закрыться или взять атакующую фигуру.';
  if(move.flags.includes('k')||move.flags.includes('q'))return 'Рокировка: король уходит в безопасность, а ладья выходит в игру. Её можно сделать только если король и ладья ещё не ходили и король не проходит через шах.';
  if(move.flags.includes('e'))return 'Взятие на проходе — специальное право пешки. Оно доступно только сразу после того, как пешка соперника прошла два поля.';
  if(move.promotion)return 'Превращение пешки! Дошла до последней горизонтали — выбирай любую фигуру, чаще всего ферзя.';
  if(move.captured)return `Ты взял фигуру на ${move.to}. Считай материал, но не забывай: активность фигур и безопасность короля тоже важны.`;
  return `Ход ${move.san}. Следи за центром, развивай фигуры и не оставляй их под боем. Перед каждым ходом проверь: что угрожает соперник?`;
}
function handlePuzzleMove(move){
  if(move.san==='Nxd5'){
    puzzleSolved=true;
    showComment('ЗАДАЧА РЕШЕНА','Верно! Конь забирает пешку в центре и вскрывает тактические угрозы. Красиво — почти нечего язвить.',true);
    renderBoard();
    return;
  }
  game.undo();
  selected=null;legalTargets=[];lastMove=null;renderBoard();
  showComment('ПОПРОБУЙ ЕЩЁ','Не спеши: ищи активный ход конём, который использует перегруженную защиту центра. Подсказка: цель — d5.',false);
}
function finishGame(){
  gameEnded=true;aiThinking=false;selected=null;legalTargets=[];renderBoard();
  const text=game.isCheckmate()?(game.turn()==='w'?pick(phrases.lose):pick(phrases.win)):pick(phrases.draw);
  showComment(game.isCheckmate()?(game.turn()==='w'?'ПОРАЖЕНИЕ':'ПОБЕДА'):'НИЧЬЯ',text,true);
  stopClocks();
}
function resultLabel(){return terminalLabel|| (game.isCheckmate()?'МАТ':game.isDraw()?'НИЧЬЯ':'ПАРТИЯ ОКОНЧЕНА');}
function endByForfeit(label, text){
  if(gameEnded)return;
  gameEnded=true;terminalLabel=label;aiThinking=false;selected=null;legalTargets=[];pendingPromotion=null;$('#promotion-modal').classList.add('hidden');stopClocks();renderBoard();showComment(label,text,true);
}
function renderMoves(){
  const list=$('#move-list'),hist=game.history();
  if(!hist.length){list.innerHTML='<div class="empty-moves">Партия только началась.<br>Не заставляй меня ждать.</div>';return;}
  list.replaceChildren();
  for(let i=0;i<hist.length;i+=2){
    const num=document.createElement('span');num.className='move-number';num.textContent=`${Math.floor(i/2)+1}.`;
    const white=document.createElement('span');white.className='move-entry'+(i===hist.length-1?' latest':'');white.textContent=hist[i];
    const black=document.createElement('span');black.className='move-entry'+(i+1===hist.length-1?' latest':'');black.textContent=hist[i+1]||'';
    list.append(num,white,black);
  }
  list.scrollTop=list.scrollHeight;
}
function say(text){
  if(!soundEnabled||muted||!('speechSynthesis'in window))return;
  window.speechSynthesis.cancel();
  const utter=new SpeechSynthesisUtterance(text);utter.lang='ru-RU';utter.volume=Number($('#volume').value)/100;
  const style=$('#voice-style').value;const filtered=voices.filter(v=>v.lang.toLowerCase().startsWith('ru'));
  let chosen=filtered.find(v=>style==='female'?/female|к|ирина|алена|милена|жен/i.test(v.name):/male|муж|dmit|павел|yuri|юрий/i.test(v.name));
  if(!chosen&&filtered.length)chosen=filtered[0];if(chosen)utter.voice=chosen;
  utter.rate=style==='calm'?.91:1.04;utter.pitch=style==='female'?1.04:.87;window.speechSynthesis.speak(utter);
}
function setMode(next){
  mode=next;gameEnded=false;puzzleSolved=false;terminalLabel='';aiThinking=false;pendingPromotion=null;$('#promotion-modal').classList.add('hidden');
  document.querySelectorAll('.mode-item').forEach(b=>b.classList.toggle('active',b.dataset.mode===next));
  const titles={ai:'ПАРТИЯ ПРОТИВ ИИ',local:'ЛОКАЛЬНАЯ ПАРТИЯ',blitz:'БЛИЦ · 3 МИНУТЫ',puzzle:'ШАХМАТНАЯ ЗАДАЧА',learn:'ОБУЧЕНИЕ С ИИ',analysis:'АНАЛИЗ ПАРТИИ',uncensored:'БЕЗ ЦЕНЗУРЫ'};
  $('#mode-label').textContent=titles[next]||titles.ai;
  if(next==='uncensored'){profanity=true;$('#profanity-switch').classList.add('on');$('#profanity-switch').setAttribute('aria-checked','true');}
  if(next==='blitz'){blitz=true;playerSeconds=180;aiSeconds=180;}else{blitz=false;}
  if(next==='puzzle'){
    game.load('r1bqk2r/ppp2ppp/2n2n2/2bp4/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w kq - 0 1');
    lastMove=null;showComment('ЗАДАЧА','Белые ходят. Найди сильнейший тактический ход — тут есть что выиграть. Не тыкай наугад, Гарри всё заметит.',true);
  }else{game.reset();lastMove=null;showComment('НОВАЯ ПАРТИЯ',next==='learn'?'Добро пожаловать на урок. Ходи, а я объясню, что происходит и почему.':pick(phrases.intro),true);}
  aiThinking=false;selected=null;legalTargets=[];gameNumber++;$('#game-number').textContent=String(gameNumber).padStart(3,'0');renderBoard();if(blitz)startClocks();else stopClocks();
}
function resetGame(){
  if(mode==='puzzle'){setMode('puzzle');return;}
  gameNumber++;$('#game-number').textContent=String(gameNumber).padStart(3,'0');aiThinking=false;gameEnded=false;puzzleSolved=false;terminalLabel='';selected=null;legalTargets=[];lastMove=null;pendingPromotion=null;$('#promotion-modal').classList.add('hidden');
  game.reset();playerSeconds=180;aiSeconds=180;renderBoard();showComment('НОВАЯ ПАРТИЯ',pick(phrases.intro),true);if(blitz)startClocks();else stopClocks();
}
function undoMove(){
  if(aiThinking)return;
  const wasEnded=gameEnded;
  let undone=game.undo();
  if(mode!=='local'&&mode!=='analysis'&&undone&&game.turn()==='b')game.undo();
  if(undone){gameEnded=false;puzzleSolved=false;terminalLabel='';lastMove=null;selected=null;legalTargets=[];renderBoard();showComment('ОТМЕНА',wasEnded?'Партия продолжена. Этого финала не было.':'Ход отменён. Не волнуйся, я не буду делать вид, что этого не видел.',false);if(blitz)startClocks();}
}
function startClocks(){stopClocks();clockTimer=setInterval(()=>{
  if(gameEnded||game.isGameOver())return stopClocks();
  if(game.turn()==='w')playerSeconds--;else aiSeconds--;
  updateClocks();
  if(playerSeconds<=0)endByForfeit('ВРЕМЯ ВЫШЛО','Твоё время вышло. В блице даже думать нужно быстро — неожиданно, да?');
  else if(aiSeconds<=0)endByForfeit('ПОБЕДА ПО ВРЕМЕНИ','У Гарри закончилось время. Вот это редкий случай: часы оказались сильнее гроссмейстера.');
},1000);}
function stopClocks(){if(clockTimer)clearInterval(clockTimer);clockTimer=null;}
function fmtTime(sec){return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;}
function updateClocks(){if(!blitz){$('#user-clock').textContent='∞';$('#ai-clock').textContent='∞';return;}$('#user-clock').textContent=fmtTime(playerSeconds);$('#ai-clock').textContent=fmtTime(aiSeconds);}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2100);}

// Events
$('#difficulty').addEventListener('change',e=>{const names={1:'Разминается',2:'Уверенный',3:'Крепкий орешек',4:'Гроссмейстер'};$('#difficulty-name').textContent=names[e.target.value];if(engine)engine.postMessage(`setoption name Skill Level value ${[3,8,14,20][Number(e.target.value)-1]}`);});
document.querySelectorAll('.mode-item').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$('#restart-btn').addEventListener('click',resetGame);$('#new-game-top').addEventListener('click',resetGame);
$('#undo-btn').addEventListener('click',undoMove);
$('#flip-btn').addEventListener('click',()=>{boardEl.dataset.flipped=boardEl.dataset.flipped!=='true';renderBoard();});
$('#sound-toggle').addEventListener('click',()=>{soundEnabled=!soundEnabled;$('#sound-toggle').textContent=soundEnabled?'◖))':'◖×';if(!soundEnabled)window.speechSynthesis?.cancel();});
$('#replay-btn').addEventListener('click',()=>say(lastComment));
$('#profanity-switch').addEventListener('click',()=>{profanity=!profanity;$('#profanity-switch').classList.toggle('on',profanity);$('#profanity-switch').setAttribute('aria-checked',String(profanity));if(profanity)toast('Режим без цензуры включён. Держи уши востро.');});
document.querySelectorAll('.levels button').forEach(b=>b.addEventListener('click',()=>{profanityLevel=Number(b.dataset.level);document.querySelectorAll('.levels button').forEach(x=>x.classList.toggle('selected',x===b));}));
$('#volume').addEventListener('input',e=>$('#volume-value').textContent=`${e.target.value}%`);
$('#voice-style').addEventListener('change',()=>$('#voice-caption').textContent=`РУССКИЙ · ${$('#voice-style').selectedOptions[0].text.toUpperCase()}`);
document.querySelectorAll('.panel-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.panel-tab').forEach(t=>t.classList.toggle('selected',t===b));const moves=b.dataset.tab==='moves';$('#moves-view').classList.toggle('hidden',!moves);$('#comment-view').classList.toggle('hidden',moves);}));
document.querySelectorAll('.promotion-options button').forEach(b=>b.addEventListener('click',()=>{if(!pendingPromotion)return;$('#promotion-modal').classList.add('hidden');makeMove({...pendingPromotion,promotion:b.dataset.piece});pendingPromotion=null;}));
$('#promotion-modal').addEventListener('click',e=>{if(e.target.id==='promotion-modal'){$('#promotion-modal').classList.add('hidden');pendingPromotion=null;}});
$('#resign-btn').addEventListener('click',()=>{
  if(gameEnded||game.isGameOver())return;
  const resigningSide=['local','analysis'].includes(mode)?game.turn():'w';
  const playerWon=resigningSide==='b';
  endByForfeit(playerWon?'ПОБЕДА':'СДАЧА',playerWon?'Соперник сдался. Редкий момент, когда чёрные решили не проверять твою защиту.':'Партия сдана. Иногда самая сильная комбинация — закрыть доску и сделать чай.');
});

if('speechSynthesis'in window){voices=window.speechSynthesis.getVoices();window.speechSynthesis.onvoiceschanged=()=>{voices=window.speechSynthesis.getVoices();};}
initEngine();renderBoard();
