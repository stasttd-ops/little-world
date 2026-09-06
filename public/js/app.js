document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

    const safeText = (value, fallback = "") => {
        return value == null ? fallback : String(value);
    };

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds)) return "0:00";

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${String(secs).padStart(2, "0")}`;
    };

    /* =========================================================
       BACKGROUND
    ========================================================= */

    const stars = $("#stars");

    if (stars) {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 100; i++) {
            const star = document.createElement("span");

            star.className = "star";
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 4}s`;
            star.style.animationDuration = `${2 + Math.random() * 4}s`;

            fragment.appendChild(star);
        }

        stars.appendChild(fragment);
    }

    const heroHearts = $("#heroHearts");

    if (heroHearts) {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 18; i++) {
            const heart = document.createElement("span");

            heart.textContent = "♡";
            heart.className = "hero-heart";

            heart.style.left = `${Math.random() * 100}%`;
            heart.style.top = `${Math.random() * 100}%`;
            heart.style.animationDelay = `${Math.random() * 5}s`;
            heart.style.animationDuration = `${5 + Math.random() * 5}s`;
            heart.style.fontSize = `${12 + Math.random() * 22}px`;

            fragment.appendChild(heart);
        }

        heroHearts.appendChild(fragment);
    }

    /* =========================================================
       NAVIGATION
    ========================================================= */

    const navBurger = $("#navBurger");
    const navLinks = $("#navLinks");

    if (navBurger && navLinks) {
        navBurger.addEventListener("click", () => {
            navBurger.classList.toggle("active");
            navLinks.classList.toggle("active");
        });

        $$(".nav__link", navLinks).forEach((link) => {
            link.addEventListener("click", () => {
                navBurger.classList.remove("active");
                navLinks.classList.remove("active");
            });
        });
    }

    /* =========================================================
       CATS
    ========================================================= */

    const catsGrid = $("#catsGrid");

    let cats = [];

    const fallbackCats = [
        {
            id: 1,
            name: "Milo",
            emoji: "🐱",
            color: "#f2c6a0",
            description: "маленький сонний пухнастик"
        },
        {
            id: 2,
            name: "Luna",
            emoji: "🐈",
            color: "#d7c5ff",
            description: "нічна принцеса"
        },
        {
            id: 3,
            name: "Mochi",
            emoji: "😺",
            color: "#fff1d6",
            description: "найніжніший котик"
        },
        {
            id: 4,
            name: "Neko",
            emoji: "😸",
            color: "#c8e6ff",
            description: "маленький бешкетник"
        }
    ];

    function createFloatingHeart(x, y) {
        const heart = document.createElement("div");

        heart.className = "floating-heart";
        heart.textContent = "♡";

        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;

        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1200);
    }

    async function petCat(cat, button) {
        if (button) {
            button.disabled = true;

            setTimeout(() => {
                button.disabled = false;
            }, 500);
        }

        const rect = button
            ? button.getBoundingClientRect()
            : {
                left: window.innerWidth / 2,
                top: window.innerHeight / 2
            };

        createFloatingHeart(
            rect.left + rect.width / 2,
            rect.top
        );

        try {
            await fetch("/api/stats/pet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cat: cat?.name || "unknown"
                })
            });
        } catch (error) {
            // Backend statistics are optional.
        }
    }

    function renderCats() {
        if (!catsGrid) return;

        catsGrid.innerHTML = "";

        cats.forEach((cat) => {
            const card = document.createElement("article");

            card.className = "cat-card";

            card.innerHTML = `
                <div class="cat-card__image">
                    <span class="cat-card__emoji">${safeText(cat.emoji, "🐱")}</span>
                </div>

                <div class="cat-card__body">
                    <h3>${safeText(cat.name, "Kitty")}</h3>
                    <p>${safeText(cat.description, "маленький пухнастик")}</p>

                    <button class="cat-card__button" type="button">
                        погладити ♡
                    </button>
                </div>
            `;

            const button = $(".cat-card__button", card);

            button.addEventListener("click", () => {
                petCat(cat, button);
            });

            catsGrid.appendChild(card);
        });
    }

    async function loadCats() {
        try {
            const response = await fetch("/api/cats", {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("Failed to load cats");
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                cats = data;
            } else if (Array.isArray(data.cats)) {
                cats = data.cats;
            }

            if (!cats.length) {
                cats = fallbackCats;
            }
        } catch (error) {
            cats = fallbackCats;
        }

        renderCats();
    }

    loadCats();

    /* =========================================================
       ROOM
    ========================================================= */

    const roomCaption = $("#roomCaption");
    const roomCat = $("#roomCat");

    const roomMessages = {
        "obj-window": [
            "за вікном тихий вечір ♡",
            "котик дивиться на зорі",
            "там десь теж є маленькі котики"
        ],

        "obj-lamp": [
            "лампа вмикає затишок ✨",
            "стало тепліше",
            "ідеальний вечір для відпочинку"
        ],

        "obj-plant": [
            "рослинка теж дивиться на тебе 🌱",
            "полий її уявно ♡",
            "вона сьогодні гарно росте"
        ],

        "obj-bed": [
            "ліжко каже: час відпочити",
            "тут дуже зручно",
            "котик вже майже заснув..."
        ],

        "obj-toy": [
            "іграшка чекає на котика",
            "хтось явно хоче погратися",
            "м'ячик покотився!"
        ],

        "obj-bowl": [
            "мисочка порожня...",
            "котик явно натякає на вечерю",
            "ще одну смакоту? ♡"
        ]
    };

    function showRoomMessage(message) {
        if (!roomCaption) return;

        roomCaption.textContent = message;

        roomCaption.classList.remove("show");

        requestAnimationFrame(() => {
            roomCaption.classList.add("show");
        });
    }

    Object.keys(roomMessages).forEach((id) => {
        const object = $(`#${id}`);

        if (!object) return;

        object.addEventListener("click", () => {
            const messages = roomMessages[id];
            const message = messages[Math.floor(Math.random() * messages.length)];

            showRoomMessage(message);
        });
    });

    if (roomCat) {
        roomCat.addEventListener("click", (event) => {
            const rect = roomCat.getBoundingClientRect();

            createFloatingHeart(
                rect.left + rect.width / 2,
                rect.top + 10
            );

            showRoomMessage("мррр... ♡");

            roomCat.classList.remove("room-cat--happy");

            requestAnimationFrame(() => {
                roomCat.classList.add("room-cat--happy");
            });
        });
    }

    /* =========================================================
       WINDOW / LAMP
    ========================================================= */

    const windowSky = $("#windowSky");
    const windowScenery = $("#windowScenery");

    if (windowSky) {
        let night = true;

        windowSky.addEventListener("click", () => {
            night = !night;

            windowSky.classList.toggle("day", !night);

            if (windowScenery) {
                windowScenery.classList.toggle("day", !night);
            }

            showRoomMessage(
                night
                    ? "ніч повернулася 🌙"
                    : "сонечко виглянуло ☀️"
            );
        });
    }

    const lampShade = $("#lampShade");
    const lampBulb = $("#lampBulb");
    const lampGlow = $("#lampGlow");

    if (lampShade || lampBulb || lampGlow) {
        let lampOn = true;

        const toggleLamp = () => {
            lampOn = !lampOn;

            if (lampShade) {
                lampShade.classList.toggle("off", !lampOn);
            }

            if (lampBulb) {
                lampBulb.classList.toggle("off", !lampOn);
            }

            if (lampGlow) {
                lampGlow.classList.toggle("off", !lampOn);
            }

            showRoomMessage(
                lampOn
                    ? "лампа знову світить ✨"
                    : "тепер темніше..."
            );
        };

        [lampShade, lampBulb, lampGlow]
            .filter(Boolean)
            .forEach((element) => {
                element.addEventListener("click", toggleLamp);
            });
    }

    /* =========================================================
       GAMES
    ========================================================= */

    const gameTabs = $$(".games__tab");

    gameTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const game = tab.dataset.game;

            gameTabs.forEach((item) => {
                item.classList.toggle(
                    "active",
                    item === tab
                );
            });

            $$(".game-panel").forEach((panel) => {
                panel.classList.remove("active");
            });

            const target = $(`#game-${game}`);

            if (target) {
                target.classList.add("active");
            }
        });
    });

    /* =========================================================
       CATCH GAME
    ========================================================= */

    const catchStart = $("#catchStart");
    const catchStage = $("#catchStage");
    const catchCat = $("#catchCat");
    const catchScore = $("#catchScore");
    const catchBest = $("#catchBest");
    const catchTime = $("#catchTime");
    const catchHint = $("#catchHint");

    let catchScoreValue = 0;
    let catchBestValue = Number(localStorage.getItem("little-world-catch-best") || 0);
    let catchTimeLeft = 20;
    let catchTimer = null;
    let catchRunning = false;

    if (catchBest) {
        catchBest.textContent = String(catchBestValue);
    }

    function moveCatchCat() {
        if (!catchCat || !catchStage) return;

        const stageRect = catchStage.getBoundingClientRect();

        const catWidth = catchCat.offsetWidth || 70;
        const catHeight = catchCat.offsetHeight || 70;

        const maxX = Math.max(0, stageRect.width - catWidth);
        const maxY = Math.max(0, stageRect.height - catHeight);

        catchCat.style.left = `${Math.random() * maxX}px`;
        catchCat.style.top = `${Math.random() * maxY}px`;
    }

    function finishCatchGame() {
        catchRunning = false;

        if (catchTimer) {
            clearInterval(catchTimer);
            catchTimer = null;
        }

        if (catchScoreValue > catchBestValue) {
            catchBestValue = catchScoreValue;

            localStorage.setItem(
                "little-world-catch-best",
                String(catchBestValue)
            );

            if (catchBest) {
                catchBest.textContent = String(catchBestValue);
            }
        }

        if (catchHint) {
            catchHint.textContent =
                `готово! ти зловив котика ${catchScoreValue} разів ♡`;
        }

        if (catchStart) {
            catchStart.disabled = false;
            catchStart.textContent = "ще раз";
        }

        if (catchCat) {
            catchCat.style.display = "none";
        }

        try {
            fetch("/api/stats/game", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    game: "catch",
                    score: catchScoreValue
                })
            });
        } catch (error) {
            // Optional statistics.
        }
    }

    function startCatchGame() {
        if (!catchStage || !catchCat) return;

        catchRunning = true;
        catchScoreValue = 0;
        catchTimeLeft = 20;

        if (catchScore) {
            catchScore.textContent = "0";
        }

        if (catchTime) {
            catchTime.textContent = "20";
        }

        if (catchHint) {
            catchHint.textContent = "лови котика! ♡";
        }

        catchCat.style.display = "block";

        moveCatchCat();

        if (catchTimer) {
            clearInterval(catchTimer);
        }

        catchTimer = setInterval(() => {
            catchTimeLeft--;

            if (catchTime) {
                catchTime.textContent = String(catchTimeLeft);
            }

            if (catchTimeLeft <= 0) {
                finishCatchGame();
            }
        }, 1000);
    }

    if (catchStart) {
        catchStart.addEventListener("click", startCatchGame);
    }

    if (catchCat) {
        catchCat.addEventListener("click", () => {
            if (!catchRunning) return;

            catchScoreValue++;

            if (catchScore) {
                catchScore.textContent = String(catchScoreValue);
            }

            const rect = catchCat.getBoundingClientRect();

            createFloatingHeart(
                rect.left + rect.width / 2,
                rect.top
            );

            moveCatchCat();
        });
    }

    window.addEventListener("resize", () => {
        if (catchRunning) {
            moveCatchCat();
        }
    });

    /* =========================================================
       MEMORY GAME
    ========================================================= */

    const memoryGrid = $("#memoryGrid");
    const memoryStart = $("#memoryStart");
    const memoryMoves = $("#memoryMoves");
    const memoryFound = $("#memoryFound");

    const memorySymbols = [
        "🐱",
        "🌙",
        "⭐",
        "🌸",
        "🍓",
        "🦋",
        "☁️",
        "💜"
    ];

    let memoryCards = [];
    let memoryFirst = null;
    let memorySecond = null;
    let memoryLocked = false;
    let memoryMovesValue = 0;
    let memoryFoundValue = 0;

    function shuffle(array) {
        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] = [
                result[j],
                result[i]
            ];
        }

        return result;
    }

    function renderMemory() {
        if (!memoryGrid) return;

        memoryGrid.innerHTML = "";

        memoryCards.forEach((card, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "memory-card";
            button.dataset.index = String(index);

            button.innerHTML = `
                <span class="memory-card__front">?</span>
                <span class="memory-card__back">${card.symbol}</span>
            `;

            if (card.flipped || card.matched) {
                button.classList.add("flipped");
            }

            if (card.matched) {
                button.classList.add("matched");
            }

            button.addEventListener("click", () => {
                handleMemoryClick(index);
            });

            memoryGrid.appendChild(button);
        });
    }

    function startMemoryGame() {
        const doubled = [...memorySymbols, ...memorySymbols];

        memoryCards = shuffle(doubled).map((symbol) => ({
            symbol,
            flipped: false,
            matched: false
        }));

        memoryFirst = null;
        memorySecond = null;
        memoryLocked = false;
        memoryMovesValue = 0;
        memoryFoundValue = 0;

        if (memoryMoves) {
            memoryMoves.textContent = "0";
        }

        if (memoryFound) {
            memoryFound.textContent = "0";
        }

        if (memoryStart) {
            memoryStart.textContent = "перемішати";
        }

        renderMemory();
    }

    function handleMemoryClick(index) {
        if (
            memoryLocked ||
            !memoryCards[index] ||
            memoryCards[index].matched ||
            memoryCards[index].flipped
        ) {
            return;
        }

        const card = memoryCards[index];

        card.flipped = true;

        if (!memoryFirst) {
            memoryFirst = index;

            renderMemory();

            return;
        }

        memorySecond = index;
        memoryMovesValue++;

        if (memoryMoves) {
            memoryMoves.textContent = String(memoryMovesValue);
        }

        renderMemory();

        const first = memoryCards[memoryFirst];
        const second = memoryCards[memorySecond];

        if (first.symbol === second.symbol) {
            first.matched = true;
            second.matched = true;

            memoryFoundValue++;

            if (memoryFound) {
                memoryFound.textContent = String(memoryFoundValue);
            }

            memoryFirst = null;
            memorySecond = null;

            renderMemory();

            if (memoryFoundValue === memorySymbols.length) {
                setTimeout(() => {
                    if (memoryStart) {
                        memoryStart.textContent = "ще раз";
                    }
                }, 300);
            }

            return;
        }

        memoryLocked = true;

        setTimeout(() => {
            first.flipped = false;
            second.flipped = false;

            memoryFirst = null;
            memorySecond = null;
            memoryLocked = false;

            renderMemory();
        }, 700);
    }

    if (memoryStart) {
        memoryStart.addEventListener("click", startMemoryGame);
    }

    if (memoryGrid) {
        startMemoryGame();
    }

    /* =========================================================
       PET GAME
    ========================================================= */

    const petFill = $("#petFill");
    const petReset = $("#petReset");
    const petBigCat = $("#petBigCat");
    const petBigCatFace = $("#petBigCatFace");
    const petHint = $("#petHint");

    let petValue = 0;

    function updatePetGame() {
        if (petFill) {
            petFill.style.width = `${petValue}%`;
        }

        if (petHint) {
            if (petValue >= 100) {
                petHint.textContent = "котик повністю щасливий! ♡";
            } else if (petValue >= 75) {
                petHint.textContent = "ще трошки погладь ♡";
            } else if (petValue >= 40) {
                petHint.textContent = "йому подобається!";
            } else {
                petHint.textContent = "погладь котика ♡";
            }
        }

        if (petBigCatFace) {
            if (petValue >= 100) {
                petBigCatFace.textContent = "😻";
            } else if (petValue >= 60) {
                petBigCatFace.textContent = "😸";
            } else {
                petBigCatFace.textContent = "🐱";
            }
        }
    }

    if (petBigCat) {
        petBigCat.addEventListener("click", () => {
            petValue = Math.min(100, petValue + 10);

            updatePetGame();

            const rect = petBigCat.getBoundingClientRect();

            createFloatingHeart(
                rect.left + rect.width / 2,
                rect.top
            );
        });
    }

    if (petReset) {
        petReset.addEventListener("click", () => {
            petValue = 0;
            updatePetGame();
        });
    }

    updatePetGame();

    /* =========================================================
       MUSIC PLAYER
       IMPORTANT:
       #player is a visual container, NOT an <audio> element.
       We use a separate Audio object.
    ========================================================= */

    const musicAudio = new Audio();

    musicAudio.preload = "metadata";
    musicAudio.volume = 0.25;

    const playerCover = $("#playerCover");
    const playerVisualizer = $("#playerVisualizer");
    const vizBars = $("#vizBars");

    const playerTrack = $("#playerTrack");
    const playerArtist = $("#playerArtist");

    const playerTimeCurrent = $("#playerTimeCurrent");
    const playerSeek = $("#playerSeek");
    const playerTimeTotal = $("#playerTimeTotal");

    const playerPrev = $("#playerPrev");
    const playerPlay = $("#playerPlay");
    const playerNext = $("#playerNext");
    const playerSpotify = $("#playerSpotify");
    const playerVolume = $("#playerVolume");

    const playlist = $("#playlist");

    let tracks = [];
    let currentTrackIndex = 0;

    const savedVolumeRaw = localStorage.getItem(
        "little-world-volume"
    );

    let savedVolume = Number(savedVolumeRaw);

    if (!Number.isFinite(savedVolume)) {
        savedVolume = 0.25;
    }

    savedVolume = Math.max(
        0,
        Math.min(1, savedVolume)
    );

    musicAudio.volume = savedVolume;

    const fallbackTracks = [
        {
            title: "Charisma",
            artist: "Jann",
            file: "/music/Jann%20-%20Charisma.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Emperor's New Clothes",
            artist: "Jann",
            file: "/music/Jann%20-%20Emperor%27s%20New%20Clothes.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Gladiator",
            artist: "Jann",
            file: "/music/Jann%20-%20Gladiator.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Lookatme",
            artist: "Jann",
            file: "/music/Jann%20-%20Lookatme.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Need A Break",
            artist: "Jann",
            file: "/music/Jann%20-%20Need%20A%20Break.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Promise",
            artist: "Jann",
            file: "/music/Jann%20-%20Promise.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Smile",
            artist: "Jann",
            file: "/music/Jann%20-%20Smile.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Kisskiss",
            artist: "Jann",
            file: "/music/Jann%20Kisskiss.mp3",
            cover: "",
            spotify: ""
        }
    ];

    function normalizeFile(file) {
        if (!file) return "";

        const value = String(file).trim();

        if (!value) return "";

        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("/")
        ) {
            return value;
        }

        return `/${value.replace(/^\.?\//, "")}`;
    }

    function normalizeTrack(track) {
        if (!track || typeof track !== "object") {
            return null;
        }

        const file = normalizeFile(
            track.file ||
            track.url ||
            track.src ||
            track.path
        );

        if (!file) {
            return null;
        }

        return {
            title: safeText(
                track.title ||
                track.name ||
                "Jann"
            ),

            artist: safeText(
                track.artist ||
                "Jann"
            ),

            file,

            cover: safeText(
                track.cover ||
                track.image ||
                ""
            ),

            spotify: safeText(
                track.spotify ||
                track.spotifyUrl ||
                ""
            )
        };
    }

    function getTrackUrl(file) {
        try {
            return new URL(
                file,
                window.location.origin
            ).href;
        } catch (error) {
            return file;
        }
    }

    function createVisualizerBars() {
        if (!vizBars) return;

        if (vizBars.children.length > 0) return;

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 28; i++) {
            const bar = document.createElement("span");

            bar.className = "viz-bar";
            bar.style.height = `${20 + Math.random() * 60}%`;
            bar.style.animationDelay = `${Math.random() * 0.8}s`;

            fragment.appendChild(bar);
        }

        vizBars.appendChild(fragment);
    }

    function renderPlaylist() {
        if (!playlist) return;

        playlist.innerHTML = "";

        tracks.forEach((track, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "playlist__item";

            if (index === currentTrackIndex) {
                button.classList.add("active");
            }

            button.innerHTML = `
                <span class="playlist__number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <span class="playlist__info">
                    <strong>${safeText(track.title)}</strong>
                    <small>${safeText(track.artist)}</small>
                </span>

                <span class="playlist__play">
                    ${index === currentTrackIndex ? "♡" : "▶"}
                </span>
            `;

            button.addEventListener("click", () => {
                loadTrack(index, true);
            });

            playlist.appendChild(button);
        });
    }

    function updatePlayerUI() {
        const track = tracks[currentTrackIndex];

        if (!track) return;

        if (playerTrack) {
            playerTrack.textContent = track.title;
        }

        if (playerArtist) {
            playerArtist.textContent = track.artist;
        }

        if (playerCover) {
            if (track.cover) {
                playerCover.style.backgroundImage =
                    `url("${track.cover}")`;
            } else {
                playerCover.style.backgroundImage = "";
            }
        }

        if (playerSpotify) {
            if (track.spotify) {
                playerSpotify.style.display = "";
                playerSpotify.href = track.spotify;
                playerSpotify.target = "_blank";
                playerSpotify.rel = "noopener noreferrer";
            } else {
                playerSpotify.style.display = "none";
            }
        }

        if (playerSeek) {
            playerSeek.value = "0";
        }

        if (playerTimeCurrent) {
            playerTimeCurrent.textContent = "0:00";
        }

        if (playerTimeTotal) {
            playerTimeTotal.textContent = "0:00";
        }

        renderPlaylist();
    }

    function updatePlayButton() {
        if (!playerPlay) return;

        playerPlay.textContent =
            musicAudio.paused ? "▶" : "Ⅱ";

        playerPlay.setAttribute(
            "aria-label",
            musicAudio.paused
                ? "Play"
                : "Pause"
        );

        if (playerVisualizer) {
            playerVisualizer.classList.toggle(
                "playing",
                !musicAudio.paused
            );
        }
    }

    function loadTrack(index, autoplay = false) {
        if (!tracks.length) return;

        if (index < 0) {
            index = tracks.length - 1;
        }

        if (index >= tracks.length) {
            index = 0;
        }

        currentTrackIndex = index;

        const track = tracks[currentTrackIndex];

        musicAudio.pause();

        musicAudio.src = getTrackUrl(track.file);
        musicAudio.currentTime = 0;

        updatePlayerUI();
        updatePlayButton();

        try {
            musicAudio.load();
        } catch (error) {
            console.warn("Could not load audio:", error);
        }

        if (autoplay) {
            playMusic();
        }
    }

    async function playMusic() {
        if (!tracks.length) return;

        if (!musicAudio.src) {
            loadTrack(currentTrackIndex, false);
        }

        try {
            await musicAudio.play();
        } catch (error) {
            console.warn(
                "Music playback was blocked or failed:",
                error
            );
        }

        updatePlayButton();
    }

    function pauseMusic() {
        musicAudio.pause();
        updatePlayButton();
    }

    function toggleMusic() {
        if (musicAudio.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    }

    function nextTrack() {
        if (!tracks.length) return;

        const nextIndex =
            (currentTrackIndex + 1) % tracks.length;

        loadTrack(nextIndex, true);
    }

    function previousTrack() {
        if (!tracks.length) return;

        const previousIndex =
            (currentTrackIndex - 1 + tracks.length) %
            tracks.length;

        loadTrack(previousIndex, true);
    }

    async function loadMusic() {
        let apiTracks = [];

        try {
            const response = await fetch("/api/music", {
                cache: "no-store"
            });

            if (response.ok) {
                const data = await response.json();

                if (Array.isArray(data)) {
                    apiTracks = data;
                } else if (Array.isArray(data.tracks)) {
                    apiTracks = data.tracks;
                }
            }
        } catch (error) {
            console.warn(
                "Music API unavailable, using local tracks."
            );
        }

        tracks = apiTracks
            .map(normalizeTrack)
            .filter(Boolean);

        if (!tracks.length) {
            tracks = fallbackTracks
                .map(normalizeTrack)
                .filter(Boolean);
        }

        createVisualizerBars();

        currentTrackIndex = 0;

        renderPlaylist();

        loadTrack(0, false);

        console.log(
            "Music tracks:",
            tracks.length
        );
    }

    if (playerPlay) {
        playerPlay.addEventListener(
            "click",
            toggleMusic
        );
    }

    if (playerNext) {
        playerNext.addEventListener(
            "click",
            nextTrack
        );
    }

    if (playerPrev) {
        playerPrev.addEventListener(
            "click",
            previousTrack
        );
    }

    if (playerVolume) {
        playerVolume.min = "0";
        playerVolume.max = "1";
        playerVolume.step = "0.01";
        playerVolume.value = String(savedVolume);

        playerVolume.addEventListener("input", () => {
            const value = Number(playerVolume.value);

            musicAudio.volume = Math.max(
                0,
                Math.min(1, value)
            );

            localStorage.setItem(
                "little-world-volume",
                String(musicAudio.volume)
            );
        });
    }

    if (playerSeek) {
        playerSeek.addEventListener("input", () => {
            if (!Number.isFinite(musicAudio.duration)) {
                return;
            }

            const percent = Number(playerSeek.value) / 100;

            musicAudio.currentTime =
                musicAudio.duration * percent;
        });
    }

    musicAudio.addEventListener("loadedmetadata", () => {
        if (playerTimeTotal) {
            playerTimeTotal.textContent =
                formatTime(musicAudio.duration);
        }

        if (playerSeek) {
            playerSeek.value = "0";
        }
    });

    musicAudio.addEventListener("timeupdate", () => {
        if (playerTimeCurrent) {
            playerTimeCurrent.textContent =
                formatTime(musicAudio.currentTime);
        }

        if (
            playerSeek &&
            Number.isFinite(musicAudio.duration) &&
            musicAudio.duration > 0
        ) {
            playerSeek.value = String(
                (musicAudio.currentTime /
                    musicAudio.duration) *
                100
            );
        }
    });

    musicAudio.addEventListener("play", () => {
        updatePlayButton();
        renderPlaylist();
    });

    musicAudio.addEventListener("pause", () => {
        updatePlayButton();
        renderPlaylist();
    });

    musicAudio.addEventListener("ended", () => {
        nextTrack();
    });

    musicAudio.addEventListener("error", () => {
        console.warn(
            "Audio error:",
            musicAudio.error
        );

        updatePlayButton();
    });

    loadMusic();

    /* =========================================================
       SCROLL REVEAL
    ========================================================= */

    const revealElements = $$(".reveal");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach((element) => {
            observer.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }

    /* =========================================================
       INITIAL STATE
    ========================================================= */

    if (playerVolume) {
        playerVolume.value = String(savedVolume);
    }

    console.log("♡ little world loaded");
    console.log(
        "Initial volume:",
        `${Math.round(savedVolume * 100)}%`
    );
});