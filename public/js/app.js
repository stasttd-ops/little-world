```javascript
// little world — frontend
// Vanilla JS, no build step.
// Real Jann MP3 files are loaded from /public/music/

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // -----------------------------------------------------------------
  // Fallback data
  // -----------------------------------------------------------------

  const FALLBACK_CATS = [
    {
      id: "mochi",
      name: "Mochi",
      color: "#f7c8dc",
      personality: "Sleepy dreamer who loves warm windowsills",
      favorite: "sunbeams",
      reactions: ["mrrp~", "*stretches*", "purrrr...", "zzz... huh?"]
    },
    {
      id: "luna",
      name: "Luna",
      color: "#d9c7f0",
      personality: "Curious explorer who investigates everything",
      favorite: "cardboard boxes",
      reactions: ["!!", "ooh what's that", "*sniffs curiously*", "mew?"]
    },
    {
      id: "miso",
      name: "Miso",
      color: "#f4d9a8",
      personality: "Chaotic little gremlin, zoomies at 3am",
      favorite: "chasing dust motes",
      reactions: ["mrow!!", "*zoomies*", "brrrp", "tag, you're it"]
    },
    {
      id: "neko",
      name: "Neko",
      color: "#b9e0d4",
      personality: "Gentle soul who gives the best headbutts",
      favorite: "chin scratches",
      reactions: ["prrrp", "*headbutt*", "mmrow~", "purr purr purr"]
    },
    {
      id: "mimi",
      name: "Mimi",
      color: "#f7b3b3",
      personality: "Little diva, very particular about snacks",
      favorite: "salmon flakes",
      reactions: ["mew.", "*judges you*", "...acceptable", "meow!"]
    }
  ];

  const FALLBACK_MUSIC = {
    artist: "Jann",
    tracks: [
      {
        id: "gladiator",
        title: "Gladiator",
        duration: 212,
        spotify: "https://open.spotify.com/search/Jann%20Gladiator",
        hue: 340
      },
      {
        id: "lookatme",
        title: "LOOKATME",
        duration: 182,
        spotify: "https://open.spotify.com/search/Jann%20LOOKATME",
        hue: 320
      },
      {
        id: "charisma",
        title: "Charisma",
        duration: 177,
        spotify: "https://open.spotify.com/search/Jann%20Charisma",
        hue: 300
      },
      {
        id: "need-a-break",
        title: "Need a break",
        duration: 214,
        spotify: "https://open.spotify.com/search/Jann%20Need%20a%20break",
        hue: 350
      },
      {
        id: "smile",
        title: "Smile",
        duration: 184,
        spotify: "https://open.spotify.com/search/Jann%20Smile",
        hue: 330
      },
      {
        id: "promise",
        title: "Promise",
        duration: 256,
        spotify: "https://open.spotify.com/search/Jann%20Promise",
        hue: 310
      },
      {
        id: "kisskiss",
        title: "Kisskiss",
        duration: 196,
        spotify: "https://open.spotify.com/search/Jann%20Kisskiss",
        hue: 345
      },
      {
        id: "emperors-new-clothes",
        title: "Emperor's New Clothes",
        duration: 230,
        spotify:
          "https://open.spotify.com/search/Jann%20Emperor%27s%20New%20Clothes",
        hue: 335
      }
    ]
  };

  async function getJSON(url, fallback) {
    try {
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        throw new Error("bad status");
      }

      return await res.json();
    } catch (e) {
      return fallback;
    }
  }

  async function postJSON(url, body) {
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
    } catch (e) {
      // Stats are optional.
    }
  }

  // -----------------------------------------------------------------
  // Toast
  // -----------------------------------------------------------------

  let toastTimer = null;

  function toast(msg) {
    const el = $("#toast");

    if (!el) return;

    el.textContent = msg;
    el.classList.add("is-visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      el.classList.remove("is-visible");
    }, 1800);
  }

  // -----------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------

  function initNav() {
    const burger = $("#navBurger");
    const links = $("#navLinks");

    if (!burger || !links) return;

    burger.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });

    $$(".nav__link").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });

    const sections = $$("main > section[id]");
    const navLinks = $$(".nav__link");

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((l) => {
            l.classList.toggle(
              "is-active",
              l.dataset.section === entry.target.id
            );
          });
        });
      },
      {
        rootMargin: "-45% 0px -50% 0px"
      }
    );

    sections.forEach((s) => observer.observe(s));
  }

  // -----------------------------------------------------------------
  // Background stars
  // -----------------------------------------------------------------

  function initStars() {
    const layer = $("#stars");

    if (!layer) return;

    const count = window.innerWidth < 600 ? 22 : 40;

    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");

      star.className = "star";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.animationDelay =
        (Math.random() * 4).toFixed(2) + "s";
      star.style.animationDuration =
        (3 + Math.random() * 3).toFixed(2) + "s";

      layer.appendChild(star);
    }
  }

  // -----------------------------------------------------------------
  // Hero floating hearts
  // -----------------------------------------------------------------

  function initHeroHearts() {
    const layer = $("#heroHearts");

    if (!layer) return;

    const glyphs = ["♡", "✦", "･"];

    function spawn() {
      const heart = document.createElement("span");

      heart.className = "floating-heart";
      heart.textContent =
        glyphs[Math.floor(Math.random() * glyphs.length)];

      heart.style.left = Math.random() * 100 + "%";

      heart.style.setProperty(
        "--drift",
        (Math.random() * 80 - 40).toFixed(0) + "px"
      );

      heart.style.animationDuration =
        7 + Math.random() * 5 + "s";

      heart.style.fontSize =
        0.9 + Math.random() * 0.9 + "rem";

      layer.appendChild(heart);

      setTimeout(() => heart.remove(), 13000);
    }

    for (let i = 0; i < 4; i++) {
      setTimeout(spawn, i * 700);
    }

    setInterval(spawn, 1800);
  }

  // -----------------------------------------------------------------
  // Scroll reveal
  // -----------------------------------------------------------------

  function initReveal() {
    const targets = $$(
      ".section__head, .cat-card, .room, .games__tabs, " +
      ".game-panel.is-active, .player, .playlist, .about__card"
    );

    targets.forEach((t) => {
      t.setAttribute("data-reveal", "");
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    targets.forEach((t) => observer.observe(t));
  }

  // -----------------------------------------------------------------
  // Cats
  // -----------------------------------------------------------------

  const petCounts = JSON.parse(
    localStorage.getItem("lw_pet_counts") || "{}"
  );

  function saveLocalPetCounts() {
    localStorage.setItem(
      "lw_pet_counts",
      JSON.stringify(petCounts)
    );
  }

  function renderCats(cats) {
    const grid = $("#catsGrid");

    if (!grid) return;

    grid.innerHTML = "";

    cats.forEach((cat, i) => {
      const tilt =
        (i % 2 === 0 ? -1 : 1) *
        (2 + (i % 3));

      const card = document.createElement("article");

      card.className = "cat-card";
      card.style.setProperty("--tilt", tilt + "deg");

      card.innerHTML = `
        <div class="cat-card__hearts" data-hearts></div>

        <div class="cat-card__reaction" data-reaction></div>

        <svg
          class="cat-card__portrait"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="55"
            r="34"
            fill="${cat.color}"
          />

          <path
            d="M22 40 L30 16 L42 34 Z"
            fill="${cat.color}"
          />

          <path
            d="M78 40 L70 16 L58 34 Z"
            fill="${cat.color}"
          />

          <circle
            cx="38"
            cy="54"
            r="4.5"
            fill="#493b42"
          />

          <circle
            cx="62"
            cy="54"
            r="4.5"
            fill="#493b42"
          />

          <path
            d="M46 64c4 3 4 3 8 0"
            stroke="#493b42"
            stroke-width="2.4"
            fill="none"
            stroke-linecap="round"
          />

          <path
            d="M25 60l-12-3M25 65l-13 1M75 60l12-3M75 65l13 1"
            stroke="#00000022"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>

        <h3 class="cat-card__name">
          ${cat.name}
        </h3>

        <p class="cat-card__personality">
          ${cat.personality}
        </p>

        <p class="cat-card__favorite">
          любить: ${cat.favorite}
        </p>

        <button
          class="cat-card__pet-btn"
          data-pet="${cat.id}"
        >
          Pet ♡
        </button>

        <p class="cat-card__count" data-count>
          погладили: ${petCounts[cat.id] || 0}
        </p>
      `;

      const btn = $(".cat-card__pet-btn", card);
      const reactionEl = $("[data-reaction]", card);
      const heartsEl = $("[data-hearts]", card);
      const countEl = $("[data-count]", card);

      btn.addEventListener("click", () => {
        petCounts[cat.id] =
          (petCounts[cat.id] || 0) + 1;

        saveLocalPetCounts();

        countEl.textContent =
          `погладили: ${petCounts[cat.id]}`;

        const line =
          cat.reactions[
            Math.floor(
              Math.random() * cat.reactions.length
            )
          ];

        reactionEl.textContent = line;
        reactionEl.classList.add("is-visible");

        setTimeout(() => {
          reactionEl.classList.remove("is-visible");
        }, 1200);

        for (let h = 0; h < 5; h++) {
          const heart = document.createElement("span");

          heart.className = "pop-heart";
          heart.textContent = "♡";

          heart.style.left =
            50 +
            (Math.random() * 30 - 15) +
            "%";

          heart.style.bottom = "40%";

          heart.style.setProperty(
            "--dx",
            (Math.random() * 60 - 30) +
              "px"
          );

          heart.style.animationDelay =
            h * 60 + "ms";

          heartsEl.appendChild(heart);

          setTimeout(
            () => heart.remove(),
            1000 + h * 60
          );
        }

        postJSON("/api/stats/pet", {
          catId: cat.id
        });
      });

      grid.appendChild(card);
    });

    initReveal();
  }

  // -----------------------------------------------------------------
  // Room
  // -----------------------------------------------------------------

  function initRoom() {
    const roomCat = $("#roomCat");
    const caption = $("#roomCaption");
    const lampShade = $("#lampShade");
    const lampGlow = $("#lampGlow");
    const windowSky = $("#windowSky");
    const windowScenery = $("#windowScenery");
    const emote = $(".room__cat-emote");

    if (
      !roomCat ||
      !caption ||
      !lampShade ||
      !lampGlow ||
      !windowSky ||
      !windowScenery ||
      !emote
    ) {
      return;
    }

    let lampOn = false;
    let sceneIndex = 0;

    const scenes = [
      {
        sky: "#cfe7ff",
        label: "ясний день",
        draw: () =>
          `<circle
            cx="200"
            cy="90"
            r="14"
            fill="#ffe9a8"
          />`
      },
      {
        sky: "#2c2f5c",
        label: "зоряна ніч",
        draw: () =>
          `<circle
            cx="200"
            cy="85"
            r="12"
            fill="#fdf6d8"
          />` +
          Array.from({ length: 6 })
            .map(
              (_, i) =>
                `<circle
                  cx="${80 + i * 22}"
                  cy="${75 + (i % 3) * 15}"
                  r="1.6"
                  fill="#fff"
                />`
            )
            .join("")
      },
      {
        sky: "#f6c9d8",
        label: "рожевий захід",
        draw: () =>
          `<circle
            cx="150"
            cy="150"
            r="16"
            fill="#ffcf8a"
          />`
      }
    ];

    function paintScenery() {
      const s = scenes[sceneIndex];

      windowSky.setAttribute("fill", s.sky);
      windowScenery.innerHTML = s.draw();
    }

    paintScenery();

    function showEmote(symbol) {
      emote.textContent = symbol;
      emote.setAttribute("opacity", "1");

      clearTimeout(showEmote._t);

      showEmote._t = setTimeout(() => {
        emote.setAttribute("opacity", "0");
      }, 1400);
    }

    function moveCatTo(x, y) {
      roomCat.setAttribute(
        "transform",
        `translate(${x},${y})`
      );
    }

    function bindObject(id, handler) {
      const el = $(id);

      if (!el) return;

      el.addEventListener("click", handler);

      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handler();
        }
      });
    }

    bindObject("#obj-lamp", () => {
      lampOn = !lampOn;

      lampShade.setAttribute(
        "fill",
        lampOn ? "#ffe9a8" : "#f7c8dc"
      );

      lampGlow.setAttribute(
        "opacity",
        lampOn ? "0.5" : "0"
      );

      caption.textContent = lampOn
        ? "світло увімкнено ✨"
        : "світло вимкнено";
    });

    bindObject("#obj-window", () => {
      sceneIndex =
        (sceneIndex + 1) % scenes.length;

      paintScenery();

      caption.textContent =
        `за вікном: ${scenes[sceneIndex].label}`;
    });

    bindObject("#obj-bed", () => {
      roomCat.classList.remove("is-playing");
      roomCat.classList.add("is-sleeping");

      moveCatTo(560, 300);

      showEmote("💤");

      caption.textContent =
        "котик задрімав у ліжечку";
    });

    bindObject("#obj-toy", () => {
      roomCat.classList.remove("is-sleeping");
      roomCat.classList.add("is-playing");

      moveCatTo(410, 385);

      showEmote("🐟");

      caption.textContent =
        "котик грається з рибкою!";

      setTimeout(() => {
        roomCat.classList.remove("is-playing");
      }, 1600);
    });

    bindObject("#obj-bowl", () => {
      roomCat.classList.remove(
        "is-sleeping",
        "is-playing"
      );

      moveCatTo(560, 380);

      showEmote("🥣");

      caption.textContent =
        "хрум-хрум, смачно!";
    });

    bindObject("#obj-plant", () => {
      showEmote("🌿");

      caption.textContent =
        "рослинка почувається доглянутою";
    });

    bindObject("#roomCat", () => {
      roomCat.classList.remove(
        "is-sleeping",
        "is-playing"
      );

      const reactions = [
        "mrow?",
        "♡",
        "purr~",
        "!!"
      ];

      showEmote(
        reactions[
          Math.floor(
            Math.random() * reactions.length
          )
        ]
      );

      caption.textContent =
        "котик дивиться на тебе з любов'ю";
    });
  }

  // -----------------------------------------------------------------
  // Games: tabs
  // -----------------------------------------------------------------

  function initGameTabs() {
    const tabs = $$(".games__tab");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.remove("is-active");
          t.setAttribute(
            "aria-selected",
            "false"
          );
        });

        tab.classList.add("is-active");

        tab.setAttribute(
          "aria-selected",
          "true"
        );

        $$(".game-panel").forEach((p) => {
          p.classList.remove("is-active");
        });

        const panel = $(
          `#game-${tab.dataset.game}`
        );

        if (panel) {
          panel.classList.add("is-active");
        }
      });
    });
  }

  // -----------------------------------------------------------------
  // Game 1: Catch the Cat
  // -----------------------------------------------------------------

  function initCatchGame() {
    const stage = $("#catchStage");
    const cat = $("#catchCat");
    const startBtn = $("#catchStart");
    const timeEl = $("#catchTime");
    const scoreEl = $("#catchScore");
    const bestEl = $("#catchBest");
    const hint = $("#catchHint");

    if (
      !stage ||
      !cat ||
      !startBtn ||
      !timeEl ||
      !scoreEl ||
      !bestEl ||
      !hint
    ) {
      return;
    }

    let best = Number(
      localStorage.getItem(
        "lw_catch_best"
      ) || 0
    );

    bestEl.textContent = best;

    let timer = null;
    let score = 0;
    let timeLeft = 30;
    let running = false;

    function placeCatRandomly() {
      const rect =
        stage.getBoundingClientRect();

      const catSize = 56;

      const maxX = Math.max(
        rect.width - catSize,
        10
      );

      const maxY = Math.max(
        rect.height - catSize,
        10
      );

      cat.style.left =
        Math.random() * maxX + "px";

      cat.style.top =
        Math.random() * maxY + "px";
    }

    function endGame() {
      running = false;

      clearInterval(timer);

      cat.style.display = "none";

      hint.style.display = "block";

      hint.textContent =
        `Гру завершено! Рахунок: ${score}`;

      if (score > best) {
        best = score;

        localStorage.setItem(
          "lw_catch_best",
          String(best)
        );

        bestEl.textContent = best;

        toast("Новий рекорд! ✨");
      }

      postJSON("/api/stats/game", {
        game: "catch",
        score
      });
    }

    startBtn.addEventListener("click", () => {
      if (running) return;

      running = true;
      score = 0;
      timeLeft = 30;

      scoreEl.textContent = "0";
      timeEl.textContent = "30";

      cat.style.display = "block";
      hint.style.display = "none";

      placeCatRandomly();

      timer = setInterval(() => {
        timeLeft -= 1;

        timeEl.textContent =
          String(timeLeft);

        if (timeLeft <= 0) {
          endGame();
        }
      }, 1000);
    });

    cat.addEventListener("click", () => {
      if (!running) return;

      score += 1;

      scoreEl.textContent =
        String(score);

      placeCatRandomly();
    });
  }

  // -----------------------------------------------------------------
  // Game 2: Cat Memory
  // -----------------------------------------------------------------

  function initMemoryGame() {
    const grid = $("#memoryGrid");
    const movesEl = $("#memoryMoves");
    const foundEl = $("#memoryFound");
    const startBtn = $("#memoryStart");

    if (
      !grid ||
      !movesEl ||
      !foundEl ||
      !startBtn
    ) {
      return;
    }

    const faces = [
      "🐱",
      "🐈",
      "🐈‍⬛",
      "🐾",
      "🧶",
      "🐟",
      "🥛",
      "🎀"
    ];

    let flipped = [];
    let matched = 0;
    let moves = 0;
    let lock = false;

    function shuffled() {
      const deck = [
        ...faces,
        ...faces
      ].map((f, i) => ({
        f,
        id: i
      }));

      for (
        let i = deck.length - 1;
        i > 0;
        i--
      ) {
        const j =
          Math.floor(
            Math.random() * (i + 1)
          );

        [
          deck[i],
          deck[j]
        ] = [
          deck[j],
          deck[i]
        ];
      }

      return deck;
    }

    function newGame() {
      grid.innerHTML = "";

      flipped = [];
      matched = 0;
      moves = 0;
      lock = false;

      movesEl.textContent = "0";
      foundEl.textContent = "0";

      shuffled().forEach((card) => {
        const btn =
          document.createElement("button");

        btn.className =
          "memory-card";

        btn.setAttribute(
          "aria-label",
          "картка котика, закрита"
        );

        btn.innerHTML = `
          <div class="memory-card__inner">
            <div class="memory-card__face memory-card__face--back">
              ♡
            </div>

            <div class="memory-card__face memory-card__face--front">
              ${card.f}
            </div>
          </div>
        `;

        btn.dataset.face =
          card.f;

        btn.addEventListener(
          "click",
          () => flipCard(btn)
        );

        grid.appendChild(btn);
      });
    }

    function flipCard(btn) {
      if (
        lock ||
        btn.classList.contains(
          "is-flipped"
        ) ||
        btn.classList.contains(
          "is-matched"
        )
      ) {
        return;
      }

      btn.classList.add(
        "is-flipped"
      );

      flipped.push(btn);

      if (flipped.length === 2) {
        moves += 1;

        movesEl.textContent =
          String(moves);

        lock = true;

        const [a, b] = flipped;

        if (
          a.dataset.face ===
          b.dataset.face
        ) {
          setTimeout(() => {
            a.classList.add(
              "is-matched"
            );

            b.classList.add(
              "is-matched"
            );

            matched += 1;

            foundEl.textContent =
              String(matched);

            flipped = [];
            lock = false;

            if (
              matched ===
              faces.length
            ) {
              toast(
                "Всі пари знайдено! ♡"
              );

              postJSON(
                "/api/stats/game",
                {
                  game: "memory",
                  score: Math.max(
                    0,
                    100 - moves
                  )
                }
              );
            }
          }, 380);
        } else {
          setTimeout(() => {
            a.classList.remove(
              "is-flipped"
            );

            b.classList.remove(
              "is-flipped"
            );

            flipped = [];
            lock = false;
          }, 700);
        }
      }
    }

    startBtn.addEventListener(
      "click",
      newGame
    );

    newGame();
  }

  // -----------------------------------------------------------------
  // Game 3: Pet the Cat
  // -----------------------------------------------------------------

  function initPetGame() {
    const cat = $("#petBigCat");
    const face = $("#petBigCatFace");
    const fill = $("#petFill");
    const hint = $("#petHint");
    const resetBtn = $("#petReset");

    if (
      !cat ||
      !face ||
      !fill ||
      !hint ||
      !resetBtn
    ) {
      return;
    }

    const faces = [
      "(=^･ω･^=)",
      "(=^‥^=)",
      "(=๏ω๏=)",
      "(=￫ω￩=)",
      "ヽ(=^･ω･^=)ノ"
    ];

    let happiness = Number(
      sessionStorage.getItem(
        "lw_pet_happiness"
      ) || 0
    );

    let bestSent = false;

    function render() {
      fill.style.width =
        happiness + "%";

      if (happiness >= 100) {
        hint.textContent =
          "Максимальне щастя! Котик обожнює тебе ♡";

        face.textContent =
          "ヽ(≧◡≦)ﾉ";

        if (!bestSent) {
          bestSent = true;

          postJSON(
            "/api/stats/game",
            {
              game: "pet",
              score: 100
            }
          );
        }
      }
    }

    render();

    cat.addEventListener(
      "click",
      () => {
        happiness = Math.min(
          100,
          happiness + 4
        );

        sessionStorage.setItem(
          "lw_pet_happiness",
          String(happiness)
        );

        face.textContent =
          faces[
            Math.floor(
              Math.random() *
              faces.length
            )
          ];

        cat.style.transform =
          `scale(${1 + Math.random() * 0.08})`;

        setTimeout(() => {
          cat.style.transform = "";
        }, 120);

        if (happiness < 100) {
          hint.textContent =
            "Муркотить дедалі гучніше...";
        }

        render();
      }
    );

    resetBtn.addEventListener(
      "click",
      () => {
        happiness = 0;
        bestSent = false;

        sessionStorage.setItem(
          "lw_pet_happiness",
          "0"
        );

        face.textContent =
          "(=^･ω･^=)";

        hint.textContent =
          "Клікай на котика — йому подобається!";

        render();
      }
    );
  }

  // -----------------------------------------------------------------
  // MUSIC PLAYER
  // Real MP3 files from /public/music/
  // -----------------------------------------------------------------

  function initPlayer(music) {
    const tracks = music.tracks || [];

    const trackEl = $("#playerTrack");
    const artistEl = $("#playerArtist");
    const playBtn = $("#playerPlay");
    const prevBtn = $("#playerPrev");
    const nextBtn = $("#playerNext");
    const seek = $("#playerSeek");
    const curTimeEl =
      $("#playerTimeCurrent");
    const totalTimeEl =
      $("#playerTimeTotal");
    const volume = $("#playerVolume");
    const spotifyLink =
      $("#playerSpotify");
    const playlistEl = $("#playlist");
    const vizBars = $("#vizBars");
    const cover = $("#playerCover");

    if (
      !trackEl ||
      !artistEl ||
      !playBtn ||
      !prevBtn ||
      !nextBtn ||
      !seek ||
      !curTimeEl ||
      !totalTimeEl ||
      !volume ||
      !spotifyLink ||
      !playlistEl ||
      !vizBars ||
      !cover
    ) {
      return;
    }

    let current = 0;
    let playing = false;
    let audio = null;
    let animationFrame = null;

    // ---------------------------------------------------------------
    // Your actual MP3 files
    // ---------------------------------------------------------------

    const musicFiles = {
      "gladiator":
        "/music/Jann%20-%20Gladiator.mp3",

      "lookatme":
        "/music/Jann%20-%20Lookatme.mp3",

      "charisma":
        "/music/Jann%20-%20Charisma.mp3",

      "need-a-break":
        "/music/Jann%20-%20Need%20A%20Break.mp3",

      "smile":
        "/music/Jann%20-%20Smile.mp3",

      "promise":
        "/music/Jann%20-%20Promise.mp3",

      "kisskiss":
        "/music/Jann%20Kisskiss.mp3",

      "emperors-new-clothes":
        "/music/Jann%20-%20Emperor%27s%20New%20Clothes.mp3"
    };

    // ---------------------------------------------------------------
    // Format time
    // ---------------------------------------------------------------

    function fmtTime(sec) {
      sec = Math.max(
        0,
        Math.floor(sec || 0)
      );

      const m = Math.floor(
        sec / 60
      );

      const s = sec % 60;

      return `${m}:${String(s).padStart(2, "0")}`;
    }

    // ---------------------------------------------------------------
    // Visualizer
    // ---------------------------------------------------------------

    const BAR_COUNT = 16;

    for (
      let i = 0;
      i < BAR_COUNT;
      i++
    ) {
      const angle =
        (i / BAR_COUNT) *
        Math.PI *
        2;

      const bar =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );

      bar.setAttribute(
        "width",
        "3"
      );

      bar.setAttribute(
        "height",
        "6"
      );

      bar.setAttribute(
        "rx",
        "1.5"
      );

      bar.setAttribute(
        "fill",
        "#f3a9c4"
      );

      bar.dataset.angle =
        angle;

      vizBars.appendChild(bar);
    }

    function paintVisualizer(active) {
      const bars =
        Array.from(
          vizBars.children
        );

      bars.forEach((bar) => {
        const angle =
          parseFloat(
            bar.dataset.angle
          );

        const len = active
          ? 6 + Math.random() * 16
          : 6;

        const cx =
          60 +
          Math.cos(angle) *
            40;

        const cy =
          60 +
          Math.sin(angle) *
            40;

        bar.setAttribute(
          "x",
          (cx - 1.5).toFixed(1)
        );

        bar.setAttribute(
          "y",
          (cy - len / 2).toFixed(1)
        );

        bar.setAttribute(
          "height",
          len.toFixed(1)
        );

        bar.setAttribute(
          "transform",
          `rotate(${(angle * 180) / Math.PI}, ${cx}, ${cy})`
        );
      });

      if (active) {
        animationFrame =
          requestAnimationFrame(
            () => {
              paintVisualizer(true);
            }
          );
      }
    }

    function stopVisualizer() {
      if (animationFrame) {
        cancelAnimationFrame(
          animationFrame
        );

        animationFrame = null;
      }

      paintVisualizer(false);
    }

    paintVisualizer(false);

    // ---------------------------------------------------------------
    // Playlist
    // ---------------------------------------------------------------

    function renderPlaylist() {
      playlistEl.innerHTML = "";

      tracks.forEach((t, i) => {
        const li =
          document.createElement(
            "li"
          );

        li.className =
          "playlist__item";

        li.dataset.index =
          String(i);

        li.innerHTML = `
          <span>
            ${i + 1}. ${t.title}
          </span>

          <span>
            ${fmtTime(t.duration)}
          </span>
        `;

        li.addEventListener(
          "click",
          () => {
            loadTrack(i, true);
          }
        );

        playlistEl.appendChild(
          li
        );
      });
    }

    function highlightPlaylist() {
      $$(".playlist__item").forEach(
        (li) => {
          li.classList.toggle(
            "is-active",
            Number(
              li.dataset.index
            ) === current
          );
        }
      );
    }

    // ---------------------------------------------------------------
    // Load track
    // ---------------------------------------------------------------

    function loadTrack(
      i,
      autoplay = false
    ) {
      if (!tracks.length) return;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
      }

      stopVisualizer();

      current =
        ((i % tracks.length) +
          tracks.length) %
        tracks.length;

      const t =
        tracks[current];

      trackEl.textContent =
        t.title;

      artistEl.textContent =
        music.artist || "Jann";

      spotifyLink.href =
        t.spotify || "#";

      seek.value = "0";
      seek.max = "0";

      curTimeEl.textContent =
        "0:00";

      totalTimeEl.textContent =
        fmtTime(t.duration);

      cover.style.background =
        `linear-gradient(
          145deg,
          hsl(${t.hue || 330} 70% 92%),
          hsl(${t.hue || 330} 65% 82%)
        )`;

      highlightPlaylist();

      const file =
        musicFiles[t.id];

      if (!file) {
        console.error(
          "Music file not found:",
          t.id
        );

        toast(
          "Файл цієї пісні не знайдено"
        );

        return;
      }

      audio =
        new Audio(file);

      audio.preload =
        "metadata";

      audio.volume =
        Number(volume.value) /
        100;

      audio.addEventListener(
        "loadedmetadata",
        () => {
          if (!audio) return;

          seek.max =
            String(audio.duration);

          totalTimeEl.textContent =
            fmtTime(
              audio.duration
            );
        }
      );

      audio.addEventListener(
        "timeupdate",
        () => {
          if (!audio) return;

          seek.value =
            String(
              audio.currentTime
            );

          curTimeEl.textContent =
            fmtTime(
              audio.currentTime
            );
        }
      );

      audio.addEventListener(
        "ended",
        () => {
          loadTrack(
            current + 1,
            true
          );
        }
      );

      audio.addEventListener(
        "error",
        () => {
          console.error(
            "Cannot load audio:",
            file
          );

          playing = false;

          playBtn.textContent =
            "▶";

          stopVisualizer();

          toast(
            "Не вдалося завантажити пісню"
          );
        }
      );

      if (autoplay) {
        play();
      }
    }

    // ---------------------------------------------------------------
    // Play
    // ---------------------------------------------------------------

    async function play() {
      if (!audio) return;

      try {
        await audio.play();

        playing = true;

        playBtn.textContent =
          "⏸";

        stopVisualizer();
        paintVisualizer(true);
      } catch (error) {
        console.error(
          "Playback error:",
          error
        );

        playing = false;

        playBtn.textContent =
          "▶";

        toast(
          "Не вдалося відтворити музику"
        );
      }
    }

    // ---------------------------------------------------------------
    // Pause
    // ---------------------------------------------------------------

    function pause() {
      if (!audio) return;

      audio.pause();

      playing = false;

      playBtn.textContent =
        "▶";

      stopVisualizer();
    }

    // ---------------------------------------------------------------
    // Controls
    // ---------------------------------------------------------------

    playBtn.addEventListener(
      "click",
      () => {
        if (playing) {
          pause();
        } else {
          play();
        }
      }
    );

    prevBtn.addEventListener(
      "click",
      () => {
        loadTrack(
          current - 1,
          playing
        );
      }
    );

    nextBtn.addEventListener(
      "click",
      () => {
        loadTrack(
          current + 1,
          playing
        );
      }
    );

    seek.addEventListener(
      "input",
      () => {
        if (!audio) return;

        audio.currentTime =
          Number(seek.value);

        curTimeEl.textContent =
          fmtTime(
            audio.currentTime
          );
      }
    );

    volume.addEventListener(
      "input",
      () => {
        if (!audio) return;

        audio.volume =
          Number(volume.value) /
          100;
      }
    );

    // ---------------------------------------------------------------
    // Start player
    // ---------------------------------------------------------------

    renderPlaylist();

    if (tracks.length) {
      loadTrack(0, false);
    }
  }

  // -----------------------------------------------------------------
  // Boot
  // -----------------------------------------------------------------

  document.addEventListener(
    "DOMContentLoaded",
    async () => {
      initNav();
      initStars();
      initHeroHearts();
      initRoom();
      initGameTabs();
      initCatchGame();
      initMemoryGame();
      initPetGame();
      initReveal();

      const [cats, music] =
        await Promise.all([
          getJSON(
            "/api/cats",
            {
              cats: FALLBACK_CATS
            }
          ),

          getJSON(
            "/api/music",
            FALLBACK_MUSIC
          )
        ]);

      renderCats(
        cats.cats ||
          FALLBACK_CATS
      );

      initPlayer(
        music.tracks
          ? music
          : FALLBACK_MUSIC
      );
    }
  );
})();
```
