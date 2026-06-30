/* ==========================================================================
   script.js — all interactivity for the monthsary site
   Sections:
   1. Sakura petal animation (canvas)
   2. Screen 1 — PIN + Love Slider gate logic
   3. Screen transition helper
   4. Screen 2 — 4 Pics 1 Word mini game
   5. Screen 3 — Dashboard modals, album lightbox, love letter envelope
   ========================================================================== */

/* ---------- 1. SAKURA PETAL ANIMATION ---------- */
(function sakuraAnimation(){
  const canvas = document.getElementById('sakura-canvas');
  const ctx = canvas.getContext('2d');
  let petals = [];
  const PETAL_COUNT = 28;

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function makePetal(){
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: 8 + Math.random() * 10,
      speedY: 0.6 + Math.random() * 1.2,
      speedX: Math.random() * 1 - 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 2 - 1,
      sway: Math.random() * Math.PI * 2
    };
  }

  for(let i=0;i<PETAL_COUNT;i++) petals.push(makePetal());

  function drawPetal(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = 'rgba(245, 178, 198, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, -p.size/2);
    ctx.bezierCurveTo(p.size/2, -p.size/2, p.size/2, p.size/2, 0, p.size/2);
    ctx.bezierCurveTo(-p.size/2, p.size/2, -p.size/2, -p.size/2, 0, -p.size/2);
    ctx.fill();
    ctx.restore();
  }

  function animate(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    petals.forEach(p=>{
      p.sway += 0.02;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.sway) * 0.6;
      p.rotation += p.rotationSpeed;
      if(p.y > canvas.height + 20){
        Object.assign(p, makePetal());
        p.y = -20;
      }
      drawPetal(p);
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---------- 3. SCREEN TRANSITION HELPER ---------- */
function goToScreen(fromId, toId){
  const fromEl = document.getElementById(fromId);
  const toEl = document.getElementById(toId);
  fromEl.classList.add('fade-out');
  setTimeout(()=>{
    fromEl.classList.remove('active','fade-out');
    toEl.classList.add('active','fade-in');
    setTimeout(()=> toEl.classList.remove('fade-in'), 900);
  }, 580);
}

/* ---------- 2. SCREEN 1 — PIN + LOVE SLIDER ---------- */
(function gateLogic(){
  const heartPins = Array.from(document.querySelectorAll('.heart-pin'));
  const keys = Array.from(document.querySelectorAll('.key'));
  const slider = document.getElementById('loveSlider');
  const sliderFill = document.getElementById('sliderFill');
  const sliderValueText = document.getElementById('sliderValueText');
  const unlockBtn = document.getElementById('unlockBtn');
  const popupOverlay = document.getElementById('popupOverlay');
  const popupClose = document.getElementById('popupClose');

  let pinDigits = []; // array of typed digits, max 6

  function renderPins(){
    heartPins.forEach((pin, i)=>{
      const digitSpan = pin.querySelector('.pin-digit');
      if(pinDigits[i] !== undefined){
        digitSpan.textContent = pinDigits[i];
        pin.classList.add('filled');
      } else {
        digitSpan.textContent = '';
        pin.classList.remove('filled');
      }
    });
  }

  keys.forEach(key=>{
    key.addEventListener('click', ()=>{
      const value = key.dataset.key;
      if(value === 'clear'){
        pinDigits = [];
      } else if(value === 'back'){
        pinDigits.pop();
      } else if(pinDigits.length < 6){
        pinDigits.push(value);
      }
      renderPins();
    });
  });

  slider.addEventListener('input', ()=>{
    const val = Number(slider.value);
    const pct = (val / 101) * 100;
    sliderFill.style.width = pct + '%';
    sliderValueText.textContent = val;
  });

  const CORRECT_PIN = '030126'; // change this to update the required PIN

  unlockBtn.addEventListener('click', ()=>{
    const pinComplete = pinDigits.join('') === CORRECT_PIN;
    const loveComplete = Number(slider.value) === 101;

    if(pinComplete && loveComplete){
      goToScreen('screen-gate', 'screen-game');
    } else {
      popupOverlay.classList.add('show');
    }
  });

  popupClose.addEventListener('click', ()=>{
    popupOverlay.classList.remove('show');
  });
})();

/* ---------- 4. SCREEN 2 — 4 PICS 1 WORD MINI GAME ---------- */
(function miniGame(){
  const ANSWER = 'MAHAL';
  const answerRow = document.getElementById('answerRow');
  const letterKeyboard = document.getElementById('letterKeyboard');
  const clearBtn = document.getElementById('gameClearBtn');
  const backBtn = document.getElementById('gameBackBtn');
  const feedback = document.getElementById('gameFeedback');
  const confettiLayer = document.getElementById('confettiLayer');

  // Scrambled letters: the answer's letters plus a handful of decoys, shuffled
  const decoyLetters = ['S','N','O','R','E'];
  let letterPool = ANSWER.split('').concat(decoyLetters);
  letterPool = letterPool.sort(()=> Math.random() - 0.5);

  let currentAnswer = []; // letters currently placed in the hearts

  // Build the 5 answer hearts
  const heartPath = 'M16 27 C 16 27 2 17.5 2 9.2 C 2 4.4 5.7 1 9.9 1 C 12.7 1 15 2.6 16 5 C 17 2.6 19.3 1 22.1 1 C 26.3 1 30 4.4 30 9.2 C 30 17.5 16 27 16 27 Z';
  for(let i=0;i<ANSWER.length;i++){
    const heart = document.createElement('div');
    heart.className = 'answer-heart';
    heart.innerHTML = `<span class="heart-shape"><svg class="heart-svg" viewBox="0 0 32 29"><path d="${heartPath}"/></svg><span class="pin-digit"></span></span>`;
    answerRow.appendChild(heart);
  }

  // Build the scrambled letter keys
  letterPool.forEach((letter, idx)=>{
    const btn = document.createElement('button');
    btn.className = 'letter-key';
    btn.textContent = letter;
    btn.dataset.usedFlag = 'false';
    btn.dataset.poolIndex = idx;
    btn.addEventListener('click', ()=> handleLetterClick(btn, letter));
    letterKeyboard.appendChild(btn);
  });

  function renderAnswer(){
    const hearts = answerRow.querySelectorAll('.answer-heart');
    hearts.forEach((heart, i)=>{
      const span = heart.querySelector('.pin-digit');
      if(currentAnswer[i]){
        span.textContent = currentAnswer[i];
        heart.classList.add('filled');
      } else {
        span.textContent = '';
        heart.classList.remove('filled');
      }
    });
  }

  function handleLetterClick(btn, letter){
    if(currentAnswer.length >= ANSWER.length) return;
    if(btn.classList.contains('used')) return;
    currentAnswer.push(letter);
    btn.classList.add('used');
    renderAnswer();
    checkAnswer();
  }

  clearBtn.addEventListener('click', ()=>{
    currentAnswer = [];
    document.querySelectorAll('.letter-key').forEach(b=> b.classList.remove('used'));
    feedback.textContent = '';
    renderAnswer();
  });

  backBtn.addEventListener('click', ()=>{
    currentAnswer.pop();
    // re-enable the most recently used matching key
    const usedKeys = document.querySelectorAll('.letter-key.used');
    if(usedKeys.length) usedKeys[usedKeys.length - 1].classList.remove('used');
    feedback.textContent = '';
    renderAnswer();
  });

  function checkAnswer(){
    if(currentAnswer.length === ANSWER.length){
      if(currentAnswer.join('') === ANSWER){
        feedback.textContent = 'Yes! That\'s exactly it. 💗';
        burstConfetti();
        setTimeout(()=> goToScreen('screen-game', 'screen-dashboard'), 1600);
      } else {
        feedback.textContent = 'Not quite — try again!';
        setTimeout(()=>{
          currentAnswer = [];
          document.querySelectorAll('.letter-key').forEach(b=> b.classList.remove('used'));
          feedback.textContent = '';
          renderAnswer();
        }, 900);
      }
    }
  }

  function burstConfetti(){
    const hearts = ['💗','💕','💖','🌸','💞'];
    for(let i=0;i<40;i++){
      const span = document.createElement('span');
      span.className = 'confetti-heart';
      span.textContent = hearts[Math.floor(Math.random()*hearts.length)];
      span.style.left = Math.random()*100 + 'vw';
      span.style.animationDelay = (Math.random()*0.6) + 's';
      span.style.fontSize = (1 + Math.random()*1.4) + 'rem';
      confettiLayer.appendChild(span);
      setTimeout(()=> span.remove(), 3200);
    }
  }
})();

/* ---------- 5. SCREEN 3 — DASHBOARD MODALS, ALBUM LIGHTBOX, LOVE LETTER ---------- */
(function dashboardLogic(){
  const memCards = document.querySelectorAll('.mem-card');
  const closeButtons = document.querySelectorAll('[data-close]');

  memCards.forEach(card=>{
    card.addEventListener('click', ()=>{
      if(card.dataset.screen){
        goToScreen('screen-dashboard', card.dataset.screen);
      } else if(card.dataset.modal){
        document.getElementById(card.dataset.modal).classList.add('show');
      }
    });
  });

  // Back button on the photo album screen returns to the dashboard
  const albumBackBtn = document.getElementById('albumBackBtn');
  if(albumBackBtn){
    albumBackBtn.addEventListener('click', ()=>{
      goToScreen('screen-album', 'screen-dashboard');
    });
  }

  closeButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      btn.closest('.modal-overlay').classList.remove('show');
    });
  });

  // Close modal when clicking the dark backdrop itself
  document.querySelectorAll('[data-modal-overlay]').forEach(overlay=>{
    overlay.addEventListener('click', (e)=>{
      if(e.target === overlay) overlay.classList.remove('show');
    });
  });

  /* ----- Photo album lightbox ----- */
  const albumPhotos = document.querySelectorAll('.album-photo');
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  albumPhotos.forEach(photo=>{
    photo.addEventListener('click', ()=>{
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.alt;
      lightboxOverlay.classList.add('show');
    });
  });
  lightboxClose.addEventListener('click', ()=> lightboxOverlay.classList.remove('show'));
  lightboxOverlay.addEventListener('click', (e)=>{
    if(e.target === lightboxOverlay) lightboxOverlay.classList.remove('show');
  });

  /* ----- Love letter envelope + paper reveal ----- */
  const envelope = document.getElementById('envelope');
  const letterPaper = document.getElementById('letterPaper');
  const letterBody = document.getElementById('letterBody');

  // The letter text — replace with your own words any time, it's just plain paragraphs.
  const letterParagraphs = [
    "I've been sitting here trying to figure out how to start this, because four months sounds like such a small number on paper, and yet it feels like “oh, we’ve been this far”. It feels like an entire season of my life rearranged itself around you. So, I'll just start the way I always want to start with you— simply, and honestly.",
    "Four months ago, I had no Idea what it meant to anticipate a single message notification the way I do now. I didn't know that your laugh could become a familiar sound everywhere, even in a crowded place, even half asleep. I had no idea that I would begin narrating my day in my head just so I'd have something funny or small to tell you later. You turned out to be the person I save things for.",
    "I think what surprised me are not the obvious stuff, the dates, the calls even when I’m driving, the plans we make for tomorrow and the future. What surprised me a lot is the way you take care of me more that I do to myself. The way you maintain my mustache, the way you fixed my eyebrows, the way you clean my ears, put lotion to my feet just to make them smoother and hoping to revive my nails —that’s impossible haha. The way you remember small details about my life shows that you really pay attention about me. But the thing that makes me appreciate you a lot is the way you call me “pogi” repeatedly on a random moment – even if I treated my self as just an average looking guy.",
    "Up until now, I still can’t fully explain what makes me say I loved you – at least I know I do. But it isn’t really one big feeling, it is made of hundred small reason that makes me think I’m in love with you. It’s the relief of hearing your voice after a long day, It’s the calm I feel in my chest when I know you’re okay. It's the slightly ridiculous amount of joy I get from teasing you even when you’re really pissed and is about to explode – sorry for that hehe. And It's the purest kind of euphoria—the little child inside me feels so loved every time you surprise me with a gift. It's never about the gift —it's about feeling cherished by you.",
    "I also want to be honest that these four months haven't been so flawless. We had a lot of bad days, especially recently. There were minor miscommunications and conflicts that resulted in us yelling at one another. Then there was that one mistake that still makes me wish I could go back in time—to change it and set things right. I know it's not easy for you to forget, but I hope that, someday, you can.",
    "We've been fighting nearly every day for the past few weeks, and I know that I'm mostly to blame. I made a lot of mistakes, and it seems like every time I correct one, I make another the following day. I'm aware that I'm still learning, but I don't understand why I keep making new errors. It keeps me awake at night, thinking about the possibility of you getting tired of me or deciding to leave me. Those thoughts terrify me more than anything, and lately, I've been getting tired of myself too because I never wanted to keep hurting the person I love the most.",
    "I am sorry for being such a pain in the ass huhu. I’m sorry if I can’t make you feel the same feeling of constant happiness you’ve felt in the past. I’m sorry for causing too much pain lately, for being so insensitive and careless. I admit all these mistakes and will always try my best to improve myself more to love you even better. ",
    "I want you to know that I also noticed how hard you try,  in our relationship and in your own life. I see all your efforts and sacrifices, not just for me but for your family as well. You referred yourself as “Kikay” covering yourself with cute make up and wearing pink outfits. But you didn’t even realize how brave you are for showing up even when you’re tired. Just so you know, I appreciate you a lot more than I probably say out loud often. ",
    "We’re already on our 4th month, I am not gonna pretend that I have everything figured out about our relationship — about us. Relationships are not something we solve once and then proceed on. We may be argued a lot, fight a lot, misunderstood each other. But what’s important is we kept on choosing one another. I will always be thanking God that I’ve found the person to share my dreams with, to talk about my plans on the future—you’re the last person I will allow to tag along in my journey.",
    "Happy 4 months mahal! I have made this simple yet strange website for you, heart shaped pin code, buttons, falling petals and all. It’s a small thing compared to everything you’ve given me these past months, but I wanted to give you something you can keep for eternity, something you can always come back to on a hard day and be reminded. In case you forgot, I will never get tired of telling you these words. I will love and cherish you as you are the only person who ever showed me love that is different —that words can’t even explain. You’re my cutest little baby kengkeng! And I will always be your stupid annoying hubby hehe. ",
    "If you want, I can make it more romantic and sweeter for you. Just say “Yes” so I can proceed.",
    "Charrot hindi to chat gpt no!! so don’t be so critique in my grammar I already use Grammarly for some parts HAHAHA",
    "Happy 4th Monthsary, Mahal. Looking forward for more months and years to come, I Love you Mahal!! Muahhhh"
  
  
  ];

  letterParagraphs.forEach(text=>{
    const p = document.createElement('p');
    p.textContent = text;
    letterBody.appendChild(p);
  });

  envelope.addEventListener('click', ()=>{
    if(envelope.classList.contains('opened')) return;
    envelope.classList.add('opened');

    setTimeout(()=>{
      letterPaper.classList.add('show');
      const paragraphs = letterBody.querySelectorAll('p');
      paragraphs.forEach((p, i)=>{
        setTimeout(()=> p.classList.add('revealed'), i * 350);
      });
    }, 500);
  });
})();
