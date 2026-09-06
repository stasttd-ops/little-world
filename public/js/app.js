(() => {
  "use strict";

  const FALLBACK_CATS = [
    {
      id: "milo",
      name: "Milo",
      breed: "British Shorthair",
      color: "gray",
      emoji: "🐈",
      description: "Спокійний, пухнастий і дуже любить увагу."
    },
    {
      id: "luna",
      name: "Luna",
      breed: "Ragdoll",
      color: "cream",
      emoji: "🐱",
      description: "Маленька принцеса, яка завжди хоче обіймашки."
    },
    {
      id: "simba",
      name: "Simba",
      breed: "Orange Cat",
      color: "orange",
      emoji: "😺",
      description: "Рудий хаос, який ніколи не сидить на місці."
    },
    {
      id: "nala",
      name: "Nala",
      breed: "Calico",
      color: "white",
      emoji: "🐈‍⬛",
      description: "Ніжна киця з характером."
    }
  ];

  const FALLBACK_MUSIC = [
    {
      id: "charisma",
      title: "Charisma",
      artist: "Jann",
      file: "/music/Jann%20-%20Charisma.mp3"
    },
    {
      id: "emperors-new-clothes",
      title: "Emperor's New Clothes",
      artist: "Jann",
      file: "/music/Jann%20-%20Emperor's%20New%20Clothes.mp3"
    },
    {
      id: "gladiator",
      title: "Gladiator",
      artist: "Jann",
      file: "/music/Jann%20-%20Gladiator.mp3"
    },
    {
      id: "lookatme",
      title: "Lookatme",
      artist: "Jann",
      file: "/music/Jann%20-%20Lookatme.mp3"
    },
    {
      id: "need-a-break",
      title: "Need A Break",
      artist: "Jann",
      file: "/music/Jann%20-%20Need%20A%20Break.mp3"
    },
    {
      id: "promise",
      title: "Promise",
      artist: "Jann",
      file: "/music/Jann%20-%20Promise.mp3"
    },
    {
      id: "smile",
      title: "Smile",
      artist: "Jann",
      file: "/music/Jann%20-%20Smile.mp3"
    },
    {
      id: "kisskiss",
      title: "Kisskiss",
      artist: "Jann",
      file: "/music/Jann%20Kisskiss.mp3"
    }
  ];

  let cats = [];
  let music = [];
  let currentTrack = 0;
  let audio = null;
  let isPlaying = false;

  function getJSON(url, fallback) {
    return fetch(url, {
      method: "GET",
      cache: "no-cache"
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        return response.json();
      })
      .catch(() => fallback);
  }

  function postJSON(url, body) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }).catch(() => null);
  }

  function toast(message) {
    let oldToast = document.querySelector(".little-toast");

    if (oldToast) {
      oldToast.remove();
    }

    const element = document.createElement("div");

    element.className = "little-toast";
    element.textContent = message;

    element.style.position = "fixed";
    element.style.left = "50%";
    element.style.bottom = "30px";
    element.style.transform = "translateX(-50%)";
    element.style.zIndex = "99999";
    element.style.padding = "12px 20px";
    element.style.borderRadius = "999px";
    element.style.background = "rgba(255,255,255,.96)";
    element.style.color = "#d65b82";
    element.style.boxShadow = "0 10px 35px rgba(0,0,0,.12)";
    element.style.fontWeight = "600";
    element.style.pointerEvents = "none";

    document.body.appendChild(element);

    setTimeout(() => {
      element.style.opacity = "0";
      element.style.transition = "opacity .3s ease";

      setTimeout(() => {
        element.remove();
      }, 300);
    }, 1800);
  }

  function initNav() {
    const links = document.querySelectorAll("[data-scroll]");

    links.forEach(link => {
      link.addEventListener("click", event => {
        const targetId = link.getAttribute("data-scroll");

        if (!targetId) {
          return;
        }

        const target = document.getElementById(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });

    const mobileButton = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-menu]");

    if (mobileButton && menu) {
      mobileButton.addEventListener("click", () => {
        menu.classList.toggle("is-open");
      });
    }
  }

  function initStars() {
    const container =
      document.querySelector("[data-stars]") ||
      document.querySelector(".stars");

    if (!container) {
      return;
    }

    const count = 45;

    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");

      star.className = "star";

      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 4 + "s";
      star.style.animationDuration =
        2 + Math.random() * 4 + "s";

      container.appendChild(star);
    }
  }

  function initHeroHearts() {
    const container =
      document.querySelector("[data-hearts-bg]") ||
      document.querySelector(".hero-hearts");

    if (!container) {
      return;
    }

    for (let i = 0; i < 18; i++) {
      const heart = document.createElement("span");

      heart.textContent = "♡";
      heart.className = "floating-heart";

      heart.style.left = Math.random() * 100 + "%";
      heart.style.top = Math.random() * 100 + "%";
      heart.style.animationDelay = Math.random() * 5 + "s";
      heart.style.animationDuration =
        5 + Math.random() * 5 + "s";

      container.appendChild(heart);
    }
  }

  function initReveal() {
    const elements = document.querySelectorAll(
      "[data-reveal], .reveal"
    );

    if (!elements.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      elements.forEach(element => {
        element.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    elements.forEach(element => {
      observer.observe(element);
    });
  }

  function catSVG(cat) {
    const color = cat.color || "#f3b5c9";

    return `
      <svg
        class="cat-card__portrait"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="53"
          r="31"
          fill="${color}"
        />

        <path
          d="M25 39 L23 15 L40 29"
          fill="${color}"
        />

        <path
          d="M75 39 L77 15 L60 29"
          fill="${color}"
        />

        <circle
          cx="39"
          cy="49"
          r="4"
          fill="#463842"
        />

        <circle
          cx="61"
          cy="49"
          r="4"
          fill="#463842"
        />

        <path
          d="M46 62 Q50 67 54 62"
          fill="none"
          stroke="#463842"
          stroke-width="2"
          stroke-linecap="round"
        />

        <path
          d="M28 59 L10 55 M28 64 L9 65"
          stroke="#463842"
          stroke-width="1.5"
          stroke-linecap="round"
          opacity=".65"
        />

        <path
          d="M72 59 L90 55 M72 64 L91 65"
          stroke="#463842"
          stroke-width="1.5"
          stroke-linecap="round"
          opacity=".65"
        />
      </svg>
    `;
  }

  function renderCats() {
    const container =
      document.querySelector("[data-cats]") ||
      document.querySelector(".cats-grid") ||
      document.querySelector("#cats-grid");

    if (!container) {
      return;
    }

    container.innerHTML = "";

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

        ${catSVG(cat)}

        <div class="cat-card__content">
          <h3>${escapeHTML(cat.name || "Kitty")}</h3>

          <p class="cat-card__breed">
            ${escapeHTML(cat.breed || "Cute cat")}
          </p>

          <p class="cat-card__description">
            ${escapeHTML(
              cat.description ||
              "Маленький пухнастий друг ♡"
            )}
          </p>

          <button
            type="button"
            class="cat-card__button"
            data-pet-cat
          >
            Погладити ♡
          </button>
        </div>
      `;

      const button = card.querySelector("[data-pet-cat]");
      const hearts = card.querySelector("[data-hearts]");
      const reaction = card.querySelector("[data-reaction]");

      if (button) {
        button.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();

          if (reaction) {
            reaction.textContent = "♡ мур-мур ♡";
            reaction.classList.add("show");

            setTimeout(() => {
              reaction.classList.remove("show");
            }, 1200);
          }

          if (hearts) {
            createMiniHearts(hearts);
          }

          postJSON("/api/stats/pet", {
            cat: cat.id || cat.name || "unknown"
          });

          toast(
            (cat.name || "Котик") +
            " отримав погладжування ♡"
          );
        });
      }

      container.appendChild(card);
    });
  }

  function createMiniHearts(container) {
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement("span");

      heart.textContent = "♡";
      heart.className = "mini-heart";

      heart.style.left =
        20 + Math.random() * 60 + "%";

      heart.style.animationDelay =
        i * 0.08 + "s";

      container.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 1300);
    }
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function initRoom() {
    const buttons = document.querySelectorAll(
      "[data-room-action]"
    );

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const action =
          button.getAttribute("data-room-action");

        if (action === "lights") {
          document.body.classList.toggle("lights-off");

          toast(
            document.body.classList.contains("lights-off")
              ? "Трошки темніше ♡"
              : "Світло повернулось ✨"
          );
        }

        if (action === "heart") {
          createScreenHeart();
        }

        if (action === "music") {
          const player =
            document.querySelector("[data-player]");

          if (player) {
            player.scrollIntoView({
              behavior: "smooth"
            });
          }

          if (audio && !isPlaying) {
            playCurrentTrack();
          }
        }
      });
    });
  }

  function createScreenHeart() {
    const heart = document.createElement("div");

    heart.textContent = "♡";
    heart.style.position = "fixed";
    heart.style.left =
      30 + Math.random() * 40 + "%";
    heart.style.bottom = "80px";
    heart.style.zIndex = "99998";
    heart.style.fontSize =
      25 + Math.random() * 25 + "px";
    heart.style.color = "#e98bab";
    heart.style.pointerEvents = "none";
    heart.style.animation =
      "floatUp 2s ease forwards";

    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 2000);
  }

  function initGameTabs() {
    const tabs = document.querySelectorAll(
      "[data-game-tab]"
    );

    const panels = document.querySelectorAll(
      "[data-game-panel]"
    );

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const target =
          tab.getAttribute("data-game-tab");

        tabs.forEach(item => {
          item.classList.remove("active");
          item.classList.remove("is-active");
        });

        panels.forEach(panel => {
          panel.classList.remove("active");
          panel.classList.remove("is-active");
        });

        tab.classList.add("active");
        tab.classList.add("is-active");

        const panel =
          document.querySelector(
            `[data-game-panel="${target}"]`
          );

        if (panel) {
          panel.classList.add("active");
          panel.classList.add("is-active");
        }
      });
    });
  }

  function initCatchGame() {
    const area =
      document.querySelector("[data-catch-game]");

    if (!area) {
      return;
    }

    const target =
      area.querySelector("[data-catch-target]");

    const scoreElement =
      area.querySelector("[data-score]");

    const startButton =
      area.querySelector("[data-start-game]");

    if (!target || !startButton) {
      return;
    }

    let score = 0;
    let running = false;

    function moveTarget() {
      const rect = area.getBoundingClientRect();

      const maxX =
        Math.max(0, rect.width - target.offsetWidth);

      const maxY =
        Math.max(0, rect.height - target.offsetHeight);

      target.style.left =
        Math.random() * maxX + "px";

      target.style.top =
        Math.random() * maxY + "px";
    }

    target.addEventListener("click", () => {
      if (!running) {
        return;
      }

      score++;

      if (scoreElement) {
        scoreElement.textContent = score;
      }

      moveTarget();

      postJSON("/api/stats/game", {
        game: "catch",
        score
      });
    });

    startButton.addEventListener("click", () => {
      score = 0;
      running = true;

      if (scoreElement) {
        scoreElement.textContent = "0";
      }

      moveTarget();

      toast("Лови сердечко! ♡");

      setTimeout(() => {
        running = false;
        toast(
          "Гра закінчена! Рахунок: " + score
        );
      }, 30000);
    });
  }

  function initMemoryGame() {
    const area =
      document.querySelector("[data-memory-game]");

    if (!area) {
      return;
    }

    const grid =
      area.querySelector("[data-memory-grid]");

    const startButton =
      area.querySelector("[data-memory-start]");

    const scoreElement =
      area.querySelector("[data-memory-score]");

    if (!grid || !startButton) {
      return;
    }

    const symbols = [
      "♡",
      "🐱",
      "🌸",
      "⭐",
      "🎀",
      "☁️"
    ];

    let cards = [];
    let first = null;
    let second = null;
    let locked = false;
    let matched = 0;

    function shuffle(array) {
      return array
        .map(value => ({
          value,
          sort: Math.random()
        }))
        .sort((a, b) => a.sort - b.sort)
        .map(item => item.value);
    }

    function start() {
      const deck =
        shuffle(symbols.concat(symbols));

      grid.innerHTML = "";

      cards = [];
      first = null;
      second = null;
      locked = false;
      matched = 0;

      if (scoreElement) {
        scoreElement.textContent = "0";
      }

      deck.forEach((symbol, index) => {
        const card =
          document.createElement("button");

        card.type = "button";
        card.className = "memory-card";

        card.dataset.index = index;
        card.dataset.symbol = symbol;

        card.innerHTML = `
          <span class="memory-card__front">?</span>
          <span class="memory-card__back">
            ${symbol}
          </span>
        `;

        card.addEventListener("click", () => {
          if (
            locked ||
            card.classList.contains("open") ||
            card.classList.contains("matched")
          ) {
            return;
          }

          card.classList.add("open");

          if (!first) {
            first = card;
            return;
          }

          second = card;
          locked = true;

          if (
            first.dataset.symbol ===
            second.dataset.symbol
          ) {
            first.classList.add("matched");
            second.classList.add("matched");

            matched += 2;

            if (scoreElement) {
              scoreElement.textContent =
                String(matched / 2);
            }

            first = null;
            second = null;
            locked = false;

            if (matched === deck.length) {
              toast("Ти знайшов усі пари! ♡");
            }
          } else {
            setTimeout(() => {
              first.classList.remove("open");
              second.classList.remove("open");

              first = null;
              second = null;
              locked = false;
            }, 700);
          }
        });

        cards.push(card);
        grid.appendChild(card);
      });
    }

    startButton.addEventListener("click", start);
  }

  function initPetGame() {
    const buttons = document.querySelectorAll(
      "[data-pet]"
    );

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const value =
          button.getAttribute("data-pet");

        postJSON("/api/stats/pet", {
          cat: value || "general"
        });

        toast("Мур-мур ♡");
      });
    });
  }

  function initPlayer() {
    audio = document.querySelector(
      "audio[data-audio]"
    );

    if (!audio) {
      audio = document.querySelector("audio");
    }

    const playButton =
      document.querySelector("[data-play]");

    const prevButton =
      document.querySelector("[data-prev]");

    const nextButton =
      document.querySelector("[data-next]");

    const titleElement =
      document.querySelector("[data-track-title]");

    const artistElement =
      document.querySelector("[data-track-artist]");

    const progress =
      document.querySelector("[data-progress]");

    const progressFill =
      document.querySelector("[data-progress-fill]");

    const volume =
      document.querySelector("[data-volume]");

    if (!audio) {
      return;
    }

    function updateTrackInfo() {
      const track = music[currentTrack];

      if (!track) {
        return;
      }

      if (titleElement) {
        titleElement.textContent =
          track.title || "Unknown";
      }

      if (artistElement) {
        artistElement.textContent =
          track.artist || "Jann";
      }
    }

    function loadTrack(index) {
      if (!music.length) {
        return;
      }

      currentTrack =
        (index + music.length) %
        music.length;

      const track = music[currentTrack];

      if (!track || !track.file) {
        return;
      }

      audio.src = track.file;
      audio.load();

      updateTrackInfo();
    }

    window.loadTrack = loadTrack;

    window.playCurrentTrack = function () {
      if (!audio) {
        return;
      }

      const promise = audio.play();

      if (promise && typeof promise.catch === "function") {
        promise
          .then(() => {
            isPlaying = true;

            if (playButton) {
              playButton.textContent = "❚❚";
            }
          })
          .catch(() => {
            isPlaying = false;
            toast(
              "Натисни play ще раз ♡"
            );
          });
      }
    };

    window.pauseCurrentTrack = function () {
      audio.pause();
      isPlaying = false;

      if (playButton) {
        playButton.textContent = "▶";
      }
    };

    if (playButton) {
      playButton.addEventListener("click", () => {
        if (audio.paused) {
          window.playCurrentTrack();
        } else {
          window.pauseCurrentTrack();
        }
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        loadTrack(currentTrack - 1);
        window.playCurrentTrack();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        loadTrack(currentTrack + 1);
        window.playCurrentTrack();
      });
    }

    audio.addEventListener("play", () => {
      isPlaying = true;

      if (playButton) {
        playButton.textContent = "❚❚";
      }
    });

    audio.addEventListener("pause", () => {
      isPlaying = false;

      if (playButton) {
        playButton.textContent = "▶";
      }
    });

    audio.addEventListener("ended", () => {
      loadTrack(currentTrack + 1);
      window.playCurrentTrack();
    });

    audio.addEventListener("error", () => {
      console.warn(
        "Не вдалося завантажити трек:",
        audio.src
      );

      toast("Не вдалося завантажити музику :(");
    });

    audio.addEventListener("timeupdate", () => {
      if (
        !audio.duration ||
        !Number.isFinite(audio.duration)
      ) {
        return;
      }

      const percent =
        (audio.currentTime / audio.duration) * 100;

      if (progressFill) {
        progressFill.style.width =
          percent + "%";
      }

      if (
        progress &&
        progress.tagName === "INPUT"
      ) {
        progress.value = String(percent);
      }
    });

    if (progress) {
      progress.addEventListener("input", () => {
        if (
          !audio.duration ||
          !Number.isFinite(audio.duration)
        ) {
          return;
        }

        const percent =
          Number(progress.value);

        audio.currentTime =
          audio.duration *
          (percent / 100);
      });
    }

    if (volume) {
      volume.addEventListener("input", () => {
        audio.volume =
          Math.max(
            0,
            Math.min(
              1,
              Number(volume.value)
            )
          );
      });
    }

    loadTrack(currentTrack);
  }

  function renderMusicList() {
    const container =
      document.querySelector("[data-music-list]");

    if (!container) {
      return;
    }

    container.innerHTML = "";

    music.forEach((track, index) => {
      const item =
        document.createElement("button");

      item.type = "button";
      item.className = "music-item";

      item.innerHTML = `
        <span class="music-item__number">
          ${String(index + 1).padStart(2, "0")}
        </span>

        <span class="music-item__info">
          <strong>
            ${escapeHTML(track.title || "Track")}
          </strong>

          <small>
            ${escapeHTML(track.artist || "Jann")}
          </small>
        </span>

        <span class="music-item__play">
          ▶
        </span>
      `;

      item.addEventListener("click", () => {
        currentTrack = index;

        if (audio) {
          audio.src = track.file;
          audio.load();

          audio.play()
            .then(() => {
              isPlaying = true;
            })
            .catch(() => {
              toast(
                "Натисни play ще раз ♡"
              );
            });
        }

        document
          .querySelectorAll(".music-item")
          .forEach(element => {
            element.classList.remove("active");
          });

        item.classList.add("active");
      });

      container.appendChild(item);
    });
  }

  function boot() {
    initNav();
    initStars();
    initHeroHearts();
    initReveal();

    initRoom();
    initGameTabs();
    initCatchGame();
    initMemoryGame();
    initPetGame();

    Promise.all([
      getJSON("/api/cats", FALLBACK_CATS),
      getJSON("/api/music", FALLBACK_MUSIC)
    ]).then(results => {
      cats =
        Array.isArray(results[0])
          ? results[0]
          : FALLBACK_CATS;

      music =
        Array.isArray(results[1])
          ? results[1]
          : FALLBACK_MUSIC;

      if (!cats.length) {
        cats = FALLBACK_CATS;
      }

      if (!music.length) {
        music = FALLBACK_MUSIC;
      }

      renderCats();
      renderMusicList();
      initPlayer();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  } else {
    boot();
  }
})();