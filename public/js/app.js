(() => {
"use strict";

const FALLBACK_CATS = [
{ id: "milo", name: "Milo", breed: "British Shorthair", color: "#b9b9c5", description: "Спокійний, пухнастий і дуже любить увагу." },
{ id: "luna", name: "Luna", breed: "Ragdoll", color: "#f4dfd2", description: "Маленька принцеса, яка завжди хоче обіймашки." },
{ id: "simba", name: "Simba", breed: "Orange Cat", color: "#f2b06b", description: "Рудий хаос, який ніколи не сидить на місці." },
{ id: "nala", name: "Nala", breed: "Calico", color: "#fff6e9", description: "Ніжна киця з характером." },
{ id: "momo", name: "Momo", breed: "Pink Cat", color: "#f3b6ca", description: "Маленька сонька, яка обожнює затишок." }
];

const FALLBACK_MUSIC = [
{ id: "charisma", title: "Charisma", artist: "Jann", file: "/music/Jann%20-%20Charisma.mp3", spotify: "https://open.spotify.com/search/Jann%20Charisma" },
{ id: "emperors-new-clothes", title: "Emperor's New Clothes", artist: "Jann", file: "/music/Jann%20-%20Emperor's%20New%20Clothes.mp3", spotify: "https://open.spotify.com/search/Jann%20Emperor%27s%20New%20Clothes" },
{ id: "gladiator", title: "Gladiator", artist: "Jann", file: "/music/Jann%20-%20Gladiator.mp3", spotify: "https://open.spotify.com/search/Jann%20Gladiator" },
{ id: "lookatme", title: "Lookatme", artist: "Jann", file: "/music/Jann%20-%20Lookatme.mp3", spotify: "https://open.spotify.com/search/Jann%20Lookatme" },
{ id: "need-a-break", title: "Need A Break", artist: "Jann", file: "/music/Jann%20-%20Need%20A%20Break.mp3", spotify: "https://open.spotify.com/search/Jann%20Need%20A%20Break" },
{ id: "promise", title: "Promise", artist: "Jann", file: "/music/Jann%20-%20Promise.mp3", spotify: "https://open.spotify.com/search/Jann%20Promise" },
{ id: "smile", title: "Smile", artist: "Jann", file: "/music/Jann%20-%20Smile.mp3", spotify: "https://open.spotify.com/search/Jann%20Smile" },
{ id: "kisskiss", title: "Kisskiss", artist: "Jann", file: "/music/Jann%20Kisskiss.mp3", spotify: "https://open.spotify.com/search/Jann%20Kisskiss" }
];

let cats = [];
let music = [];
let currentTrack = 0;
let audio = null;
let catchTimer = null;
let catchRunning = false;
let catchScore = 0;
let catchBest = Number(localStorage.getItem("littleWorldCatchBest") || 0);
let memoryCards = [];
let memoryFirst = null;
let memorySecond = null;
let memoryLocked = false;
let memoryMoves = 0;
let memoryFound = 0;
let petHappiness = 0;
let roomCatPosition = "center";
let lampOn = false;

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

function escapeHTML(value) {
return String(value ?? "")
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

function getJSON(url, fallback) {
return fetch(url, { cache: "no-cache" })
.then(response => {
if (!response.ok) throw new Error("HTTP " + response.status);
return response.json();
})
.catch(() => fallback);
}

function postJSON(url, body) {
return fetch(url, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body)
}).catch(() => null);
}

function toast(message) {
const element = $("#toast");

```
if (!element) return;

element.textContent = message;
element.classList.add("is-visible", "show");

clearTimeout(element._toastTimer);

element._toastTimer = setTimeout(() => {
  element.classList.remove("is-visible", "show");
}, 1800);
```

}

function initNavigation() {
const burger = $("#navBurger");
const links = $("#navLinks");

```
if (burger && links) {
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
}

$$(".nav__link, .nav__brand, .hero__actions a, .scroll-cue").forEach(link => {
  link.addEventListener("click", () => {
    if (links) links.classList.remove("is-open");
    if (burger) {
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
});
```

}

function initBackground() {
const stars = $("#stars");

```
if (stars) {
  stars.innerHTML = "";

  for (let i = 0; i < 55; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 5 + "s";
    star.style.animationDuration = 2 + Math.random() * 4 + "s";
    stars.appendChild(star);
  }
}

const hearts = $("#heroHearts");

if (hearts) {
  hearts.innerHTML = "";

  for (let i = 0; i < 18; i++) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "♡";
    heart.style.left = Math.random() * 100 + "%";
    heart.style.top = Math.random() * 100 + "%";
    heart.style.animationDelay = Math.random() * 5 + "s";
    heart.style.animationDuration = 5 + Math.random() * 5 + "s";
    hearts.appendChild(heart);
  }
}
```

}

function initReveal() {
const elements = $$(".reveal, [data-reveal]");

```
if (!("IntersectionObserver" in window)) {
  elements.forEach(el => el.classList.add("is-visible"));
  return;
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

elements.forEach(el => observer.observe(el));
```

}

function catSVG(cat) {
const color = cat.color || "#f3b6ca";

```
return `
  <svg class="cat-card__portrait" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M24 42 L22 16 L42 31 Q50 27 58 31 L78 16 L76 42
             Q84 52 78 69 Q70 86 50 87 Q30 86 22 69 Q16 52 24 42Z"
          fill="${escapeHTML(color)}"
          stroke="#e59cb8"
          stroke-width="2.5"/>
    <circle cx="38" cy="51" r="4" fill="#493b42"/>
    <circle cx="62" cy="51" r="4" fill="#493b42"/>
    <path d="M45 63 Q50 69 55 63"
          fill="none"
          stroke="#493b42"
          stroke-width="2"
          stroke-linecap="round"/>
    <path d="M25 61 L8 57 M25 66 L8 67 M75 61 L92 57 M75 66 L92 67"
          stroke="#493b42"
          stroke-width="1.5"
          stroke-linecap="round"
          opacity=".55"/>
    <path d="M45 59 Q50 56 55 59 Q50 65 45 59Z"
          fill="#e59cb8"/>
  </svg>
`;
```

}

function renderCats() {
const grid = $("#catsGrid");

```
if (!grid) return;

grid.innerHTML = "";

cats.forEach((cat, index) => {
  const card = document.createElement("article");
  card.className = "cat-card";
  card.style.setProperty("--tilt", ((index % 2 ? 1 : -1) * (1 + index % 3)) + "deg");

  card.innerHTML = `
    <div class="cat-card__hearts"></div>
    <div class="cat-card__reaction"></div>

    ${catSVG(cat)}

    <div class="cat-card__content">
      <h3>${escapeHTML(cat.name || "Kitty")}</h3>
      <p class="cat-card__breed">${escapeHTML(cat.breed || "Cute cat")}</p>
      <p class="cat-card__description">${escapeHTML(cat.description || "Маленький пухнастий друг ♡")}</p>

      <button type="button" class="cat-card__button">
        Pet ♡
      </button>
    </div>
  `;

  const button = card.querySelector(".cat-card__button");
  const reaction = card.querySelector(".cat-card__reaction");
  const hearts = card.querySelector(".cat-card__hearts");

  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    reaction.textContent = "♡ мур-мур ♡";
    reaction.classList.add("show");

    for (let i = 0; i < 5; i++) {
      const heart = document.createElement("span");
      heart.textContent = "♡";
      heart.className = "mini-heart";
      heart.style.left = 20 + Math.random() * 60 + "%";
      heart.style.animationDelay = i * 80 + "ms";
      hearts.appendChild(heart);

      setTimeout(() => heart.remove(), 1400);
    }

    setTimeout(() => reaction.classList.remove("show"), 1200);

    postJSON("/api/stats/pet", {
      cat: cat.id || cat.name
    });

    toast(`${cat.name || "Котик"} отримав погладжування ♡`);
  });

  grid.appendChild(card);
});
```

}

function initRoom() {
const objects = [
["#obj-window", "Вікно", "window"],
["#obj-lamp", "Лампа", "lamp"],
["#obj-plant", "Рослинка", "plant"],
["#obj-bed", "Ліжечко", "bed"],
["#obj-toy", "Іграшка-рибка", "toy"],
["#obj-bowl", "Миска", "bowl"]
];

```
objects.forEach(([selector, name, action]) => {
  const object = $(selector);

  if (!object) return;

  const activate = event => {
    if (event) event.preventDefault();

    roomReaction(action, name);
  };

  object.addEventListener("click", activate);
  object.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      activate(event);
    }
  });
});
```

}

function roomReaction(action, name) {
const cat = $("#roomCat");
const caption = $("#roomCaption");
const emote = $(".room__cat-emote");

```
const positions = {
  window: "translate(170,300)",
  lamp: "translate(330,330)",
  plant: "translate(640,300)",
  bed: "translate(560,330)",
  toy: "translate(410,330)",
  bowl: "translate(600,390)"
};

if (cat && positions[action]) {
  cat.style.transition = "transform .55s cubic-bezier(.2,.8,.2,1)";
  cat.setAttribute("transform", positions[action]);
  roomCatPosition = action;
}

if (caption) {
  caption.textContent = `${name} — котик вже тут ♡`;
}

if (emote) {
  const messages = {
    window: "☁",
    lamp: "✨",
    plant: "🌱",
    bed: "♡",
    toy: "!",
    bowl: "♡"
  };

  emote.textContent = messages[action] || "♡";
  emote.setAttribute("opacity", "1");

  setTimeout(() => {
    emote.setAttribute("opacity", "0");
  }, 1000);
}

if (action === "lamp") {
  lampOn = !lampOn;

  const glow = $("#lampGlow");
  const bulb = $("#lampBulb");

  if (glow) {
    glow.style.opacity = lampOn ? "0.55" : "0";
  }

  if (bulb) {
    bulb.setAttribute("fill", lampOn ? "#ffe79b" : "#fff3c4");
  }

  document.body.classList.toggle("lights-off", !lampOn);
}

if (action === "window") {
  const sky = $("#windowSky");

  if (sky) {
    sky.setAttribute(
      "fill",
      sky.getAttribute("fill") === "#cfe7ff" ? "#d9c9ef" : "#cfe7ff"
    );
  }
}

postJSON("/api/stats/pet", { cat: "room-" + action });
toast(`${name} ♡`);
```

}

function initGames() {
initGameTabs();
initCatchGame();
initMemoryGame();
initPetGame();
}

function initGameTabs() {
const tabs = \((".games__tab");
    const panels = \)(".game-panel");

```
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.game;

    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });

    panels.forEach(panel => {
      panel.classList.toggle("is-active", panel.id === "game-" + target);
    });
  });
});
```

}

function initCatchGame() {
const start = $("#catchStart");
const cat = $("#catchCat");
const stage = $("#catchStage");
const score = $("#catchScore");
const best = $("#catchBest");
const time = $("#catchTime");
const hint = $("#catchHint");

```
if (!start || !cat || !stage) return;

best.textContent = String(catchBest);

function moveCat() {
  const rect = stage.getBoundingClientRect();

  const maxX = Math.max(0, rect.width - cat.offsetWidth - 10);
  const maxY = Math.max(0, rect.height - cat.offsetHeight - 10);

  cat.style.left = 5 + Math.random() * maxX + "px";
  cat.style.top = 5 + Math.random() * maxY + "px";
}

cat.addEventListener("click", () => {
  if (!catchRunning) return;

  catchScore++;
  score.textContent = String(catchScore);

  moveCat();

  postJSON("/api/stats/game", {
    game: "catch",
    score: catchScore
  });
});

start.addEventListener("click", () => {
  clearInterval(catchTimer);

  catchScore = 0;
  catchRunning = true;

  score.textContent = "0";
  time.textContent = "30";
  hint.textContent = "Лови котика! 🐱";

  moveCat();

  let remaining = 30;

  catchTimer = setInterval(() => {
    remaining--;
    time.textContent = String(remaining);

    if (remaining <= 0) {
      clearInterval(catchTimer);
      catchRunning = false;

      if (catchScore > catchBest) {
        catchBest = catchScore;
        localStorage.setItem("littleWorldCatchBest", String(catchBest));
        best.textContent = String(catchBest);
      }

      hint.textContent = `Гру завершено! Рахунок: ${catchScore} ♡`;
      toast(`Гру завершено — ${catchScore} очок ♡`);
    }
  }, 1000);

  toast("Лови котика! 🐱");
});
```

}

function initMemoryGame() {
const start = $("#memoryStart");
const grid = $("#memoryGrid");
const moves = $("#memoryMoves");
const found = $("#memoryFound");

```
if (!start || !grid) return;

const symbols = ["♡", "🐱", "🌸", "⭐", "🎀", "☁️", "🐾", "🍓"];

function shuffle(array) {
  const result = array.slice();

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function newGame() {
  memoryCards = [];
  memoryFirst = null;
  memorySecond = null;
  memoryLocked = false;
  memoryMoves = 0;
  memoryFound = 0;

  moves.textContent = "0";
  found.textContent = "0";

  grid.innerHTML = "";

  shuffle([...symbols, ...symbols]).forEach((symbol, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "memory-card";
    button.dataset.index = String(index);
    button.dataset.symbol = symbol;

    button.innerHTML = `
      <span class="memory-card__front">?</span>
      <span class="memory-card__back">${symbol}</span>
    `;

    button.addEventListener("click", () => flipMemory(button));

    memoryCards.push(button);
    grid.appendChild(button);
  });
}

function flipMemory(card) {
  if (
    memoryLocked ||
    card.classList.contains("open") ||
    card.classList.contains("matched")
  ) return;

  card.classList.add("open");

  if (!memoryFirst) {
    memoryFirst = card;
    return;
  }

  memorySecond = card;
  memoryLocked = true;
  memoryMoves++;

  moves.textContent = String(memoryMoves);

  if (memoryFirst.dataset.symbol === memorySecond.dataset.symbol) {
    memoryFirst.classList.add("matched");
    memorySecond.classList.add("matched");

    memoryFound++;
    found.textContent = String(memoryFound);

    memoryFirst = null;
    memorySecond = null;
    memoryLocked = false;

    if (memoryFound === symbols.length) {
      toast("Усі пари знайдено! ♡");
    }

    return;
  }

  setTimeout(() => {
    if (memoryFirst) memoryFirst.classList.remove("open");
    if (memorySecond) memorySecond.classList.remove("open");

    memoryFirst = null;
    memorySecond = null;
    memoryLocked = false;
  }, 700);
}

start.addEventListener("click", newGame);

newGame();
```

}

function initPetGame() {
const cat = $("#petBigCat");
const face = $("#petBigCatFace");
const fill = $("#petFill");
const reset = $("#petReset");
const hint = $("#petHint");

```
if (!cat) return;

function update() {
  if (fill) {
    fill.style.width = Math.min(100, petHappiness) + "%";
  }

  if (hint) {
    if (petHappiness >= 100) {
      hint.textContent = "Котик максимально щасливий! ♡";
    } else {
      hint.textContent = `Щастя котика: ${petHappiness}% ♡`;
    }
  }

  if (face) {
    if (petHappiness >= 80) face.textContent = "(=^･ω･^=)♡";
    else if (petHappiness >= 40) face.textContent = "(=^･ω･^=)";
    else face.textContent = "(=^･ω･^=)";
  }
}

cat.addEventListener("click", () => {
  petHappiness = Math.min(100, petHappiness + 5);
  update();

  cat.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.08) rotate(-2deg)" },
      { transform: "scale(1) rotate(0)" }
    ],
    {
      duration: 300,
      easing: "ease-out"
    }
  );

  postJSON("/api/stats/pet", { cat: "pet-game" });
});

if (reset) {
  reset.addEventListener("click", () => {
    petHappiness = 0;
    update();
    toast("Щастя скинуто ♡");
  });
}

update();
```

}

function formatTime(seconds) {
if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

```
const minutes = Math.floor(seconds / 60);
const secs = Math.floor(seconds % 60);

return `${minutes}:${String(secs).padStart(2, "0")}`;
```

}

function initMusic() {
audio = new Audio();
audio.preload = "metadata";

```
const play = $("#playerPlay");
const prev = $("#playerPrev");
const next = $("#playerNext");
const seek = $("#playerSeek");
const volume = $("#playerVolume");
const trackTitle = $("#playerTrack");
const artist = $("#playerArtist");
const current = $("#playerTimeCurrent");
const total = $("#playerTimeTotal");
const spotify = $("#playerSpotify");

if (volume) {
  audio.volume = Number(volume.value) / 100;

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value) / 100;
  });
}

function updateInfo() {
  const track = music[currentTrack];

  if (!track) return;

  if (trackTitle) trackTitle.textContent = track.title || "Обери трек";
  if (artist) artist.textContent = track.artist || "Jann";

  if (spotify) {
    spotify.href =
      track.spotify ||
      `https://open.spotify.com/search/${encodeURIComponent((track.artist || "") + " " + (track.title || ""))}`;
  }
}

function load(index, autoplay = false) {
  if (!music.length) return;

  currentTrack = (index + music.length) % music.length;

  const track = music[currentTrack];

  audio.src = track.file;
  audio.load();

  updateInfo();
  updatePlaylistActive();

  if (autoplay) {
    audio.play().catch(() => {
      toast("Натисни ▶ ще раз ♡");
    });
  }
}

function updatePlaylistActive() {
  $$("#playlist .music-item").forEach((item, index) => {
    item.classList.toggle("active", index === currentTrack);
  });
}

if (play) {
  play.addEventListener("click", () => {
    if (!audio.src) load(currentTrack);

    if (audio.paused) {
      audio.play().catch(() => toast("Не вдалося запустити трек ♡"));
    } else {
      audio.pause();
    }
  });
}

if (prev) {
  prev.addEventListener("click", () => {
    load(currentTrack - 1, true);
  });
}

if (next) {
  next.addEventListener("click", () => {
    load(currentTrack + 1, true);
  });
}

if (seek) {
  seek.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = audio.duration * (Number(seek.value) / 100);
  });
}

audio.addEventListener("loadedmetadata", () => {
  if (total) total.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

  if (current) current.textContent = formatTime(audio.currentTime);
  if (total) total.textContent = formatTime(audio.duration);

  if (seek) {
    seek.value = String((audio.currentTime / audio.duration) * 100);
  }
});

audio.addEventListener("play", () => {
  if (play) play.textContent = "❚❚";
  updatePlaylistActive();
});

audio.addEventListener("pause", () => {
  if (play) play.textContent = "▶";
});

audio.addEventListener("ended", () => {
  load(currentTrack + 1, true);
});

audio.addEventListener("error", () => {
  toast("Не вдалося завантажити музику :(");
});

window.littleWorldPlayer = {
  play: () => audio.play(),
  pause: () => audio.pause(),
  load
};

load(0, false);
```

}

function renderMusic() {
const playlist = $("#playlist");

```
if (!playlist) return;

playlist.innerHTML = "";

music.forEach((track, index) => {
  const item = document.createElement("li");

  item.className = "music-item";

  item.innerHTML = `
    <button type="button" class="music-item__button">
      <span class="music-item__number">${String(index + 1).padStart(2, "0")}</span>
      <span class="music-item__info">
        <strong>${escapeHTML(track.title || "Track")}</strong>
        <small>${escapeHTML(track.artist || "Jann")}</small>
      </span>
      <span class="music-item__play">▶</span>
    </button>
  `;

  const button = item.querySelector(".music-item__button");

  button.addEventListener("click", () => {
    currentTrack = index;

    if (window.littleWorldPlayer) {
      window.littleWorldPlayer.load(index, true);
    }

    $$("#playlist .music-item").forEach(element => {
      element.classList.remove("active");
    });

    item.classList.add("active");
  });

  playlist.appendChild(item);
});
```

}

function initKeyboard() {
document.addEventListener("keydown", event => {
if (event.target.matches("input, textarea, button, a")) return;

```
  if (event.key === "Escape") {
    document.body.classList.remove("lights-off");
  }
});
```

}

function boot() {
initNavigation();
initBackground();
initReveal();
initRoom();
initGames();
initKeyboard();

```
Promise.all([
  getJSON("/api/cats", FALLBACK_CATS),
  getJSON("/api/music", FALLBACK_MUSIC)
]).then(([catsData, musicData]) => {
  cats = Array.isArray(catsData) && catsData.length
    ? catsData
    : FALLBACK_CATS;

  music = Array.isArray(musicData) && musicData.length
    ? musicData
    : FALLBACK_MUSIC;

  renderCats();
  renderMusic();
  initMusic();
});
```

}

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", boot);
} else {
boot();
}
})();
