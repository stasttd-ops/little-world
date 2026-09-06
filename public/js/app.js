document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

    const safeText = (value, fallback = "") =>
        value == null ? fallback : String(value);

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${String(secs).padStart(2, "0")}`;
    };

    const clamp = (value, min, max) =>
        Math.min(max, Math.max(min, value));

    /* =========================================================
       TOAST
    ========================================================= */

    const toast = $("#toast");
    let toastTimer = null;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

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
       FLOATING HEARTS
    ========================================================= */

    function createFloatingHeart(x, y) {
        const heart = document.createElement("div");

        heart.className = "floating-heart";
        heart.textContent = "♡";

        heart.style.position = "fixed";
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.zIndex = "9999";
        heart.style.pointerEvents = "none";

        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1200);
    }

    function createCardHeart(container) {
        if (!container) return;

        let hearts = $(".cat-card__hearts", container);

        if (!hearts) {
            hearts = document.createElement("div");
            hearts.className = "cat-card__hearts";
            container.appendChild(hearts);
        }

        const heart = document.createElement("span");

        heart.className = "pet-heart";
        heart.textContent = "♡";
        heart.style.setProperty(
            "--heart-x",
            `${-35 + Math.random() * 70}px`
        );

        hearts.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1200);
    }

    /* =========================================================
       NAVIGATION
    ========================================================= */

    const navBurger = $("#navBurger");
    const navLinks = $("#navLinks");

    if (navBurger && navLinks) {
        navBurger.addEventListener("click", () => {
            const open = navLinks.classList.toggle("is-open");

            navBurger.classList.toggle("active", open);
            navBurger.setAttribute("aria-expanded", String(open));
        });

        $$(".nav__link", navLinks).forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("is-open");
                navBurger.classList.remove("active");
                navBurger.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* =========================================================
       CATS
    ========================================================= */

    const catsGrid = $("#catsGrid");

    const fallbackCats = [
        {
            id: 1,
            name: "Milo",
            emoji: "🐱",
            description: "маленький сонний пухнастик",
            personality: "сонько",
            favorite: "тепле ліжечко"
        },
        {
            id: 2,
            name: "Luna",
            emoji: "🐈",
            description: "нічна принцеса",
            personality: "спокійна",
            favorite: "місяць"
        },
        {
            id: 3,
            name: "Mochi",
            emoji: "😺",
            description: "найніжніший котик",
            personality: "ніжна",
            favorite: "обійми"
        },
        {
            id: 4,
            name: "Neko",
            emoji: "😸",
            description: "маленький бешкетник",
            personality: "грайнливий",
            favorite: "іграшки"
        },
        {
            id: 5,
            name: "Mimi",
            emoji: "😽",
            description: "маленька мрійниця",
            personality: "мрійлива",
            favorite: "зірочки"
        }
    ];

    let cats = [];

    function normalizeCat(cat, index) {
        if (!cat || typeof cat !== "object") {
            return fallbackCats[index] || fallbackCats[0];
        }

        return {
            id: cat.id ?? index + 1,
            name: safeText(cat.name, fallbackCats[index]?.name || "Kitty"),
            emoji: safeText(cat.emoji, "🐱"),
            description: safeText(
                cat.description ||
                cat.personality ||
                "маленький пухнастик"
            ),
            personality: safeText(
                cat.personality ||
                cat.description ||
                "маленький пухнастик"
            ),
            favorite: safeText(
                cat.favorite ||
                cat.favourite ||
                "обійми"
            )
        };
    }

    function renderCats() {
        if (!catsGrid) return;

        catsGrid.innerHTML = "";

        cats.forEach((cat, index) => {
            const card = document.createElement("article");

            card.className = "cat-card";

            card.style.setProperty(
                "--tilt",
                `${index % 2 === 0 ? -1 : 1.2}deg`
            );

            card.innerHTML = `
                <div class="cat-card__portrait">
                    <span class="cat-card__emoji">
                        ${safeText(cat.emoji, "🐱")}
                    </span>
                </div>

                <div class="cat-card__body">
                    <h3 class="cat-card__name">
                        ${safeText(cat.name, "Kitty")}
                    </h3>

                    <p class="cat-card__personality">
                        ${safeText(
                            cat.personality,
                            cat.description || "маленький пухнастик"
                        )}
                    </p>

                    <p class="cat-card__favorite">
                        ♡ ${safeText(cat.favorite, "обійми")}
                    </p>

                    <button
                        class="cat-card__pet-btn"
                        type="button"
                        aria-label="Погладити ${safeText(cat.name, "котика")}"
                    >
                        погладити ♡
                    </button>

                    <div class="cat-card__reaction" aria-live="polite">
                        <span>мррр... ♡</span>
                    </div>

                    <div class="cat-card__hearts" aria-hidden="true"></div>
                </div>
            `;

            const button = $(".cat-card__pet-btn", card);
            const emoji = $(".cat-card__emoji", card);
            const reaction = $(".cat-card__reaction", card);

            if (button) {
                button.addEventListener("click", async () => {
                    if (button.disabled) return;

                    button.disabled = true;

                    card.classList.remove("is-petted");

                    requestAnimationFrame(() => {
                        card.classList.add("is-petted");
                    });

                    if (emoji) {
                        emoji.style.transform = "scale(1.12)";
                    }

                    if (reaction) {
                        const reactions = [
                            "мррр... ♡",
                            "ще! ♡",
                            "це приємно...",
                            "мяу ♡",
                            "погладь ще раз!"
                        ];

                        reaction.textContent =
                            reactions[
                                Math.floor(
                                    Math.random() * reactions.length
                                )
                            ];

                        reaction.classList.add("show");
                    }

                    createCardHeart(card);

                    const rect = button.getBoundingClientRect();

                    createFloatingHeart(
                        rect.left + rect.width / 2,
                        rect.top
                    );

                    setTimeout(() => {
                        if (emoji) {
                            emoji.style.transform = "";
                        }
                    }, 350);

                    setTimeout(() => {
                        if (reaction) {
                            reaction.classList.remove("show");
                        }

                        button.disabled = false;
                    }, 650);

                    try {
                        await fetch("/api/stats/pet", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                cat: cat.name
                            })
                        });
                    } catch (_) {
                        // Statistics are optional.
                    }
                });
            }

            catsGrid.appendChild(card);
        });
    }

    async function loadCats() {
        try {
            const response = await fetch("/api/cats", {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("Cats API failed");
            }

            const data = await response.json();

            let received = [];

            if (Array.isArray(data)) {
                received = data;
            } else if (Array.isArray(data.cats)) {
                received = data.cats;
            }

            if (received.length) {
                cats = received.map(normalizeCat);
            } else {
                cats = fallbackCats;
            }
        } catch (_) {
            cats = fallbackCats;
        }

        /*
         * Завжди показуємо мінімум 5 котиків.
         */
        if (cats.length < 5) {
            const existingNames = new Set(
                cats.map((cat) => cat.name)
            );

            fallbackCats.forEach((cat) => {
                if (
                    cats.length < 5 &&
                    !existingNames.has(cat.name)
                ) {
                    cats.push(cat);
                }
            });
        }

        cats = cats.slice(0, 5);

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
            "котик дивиться на зорі 🌙",
            "там десь теж є маленькі котики",
            "який гарний краєвид..."
        ],

        "obj-lamp": [
            "лампа вмикає затишок ✨",
            "стало тепліше",
            "ідеальний вечір для відпочинку",
            "котик любить це світло ♡"
        ],

        "obj-plant": [
            "рослинка теж дивиться на тебе 🌱",
            "вона сьогодні гарно росте",
            "котик нюхає листочки",
            "не забудь про рослинку ♡"
        ],

        "obj-bed": [
            "ліжко каже: час відпочити",
            "тут дуже зручно",
            "котик вже майже заснув...",
            "ідеальне місце для дрімоти 💤"
        ],

        "obj-toy": [
            "іграшка чекає на котика",
            "хтось явно хоче погратися",
            "м'ячик покотився!",
            "котик вже біжить до неї 🐾"
        ],

        "obj-bowl": [
            "мисочка порожня...",
            "котик явно натякає на вечерю",
            "ще одну смакоту? ♡",
            "мяу. Їсти."
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

    /* ---------------------------------------------------------
       ROOM CAT MOVEMENT
    --------------------------------------------------------- */

    const roomPositions = [
        { x: 330, y: 330 },
        { x: 150, y: 285 },
        { x: 235, y: 340 },
        { x: 420, y: 340 },
        { x: 555, y: 300 },
        { x: 640, y: 335 },
        { x: 475, y: 365 },
        { x: 360, y: 370 }
    ];

    let roomPositionIndex = 0;
    let roomMoveTimer = null;
    let roomPausedUntil = 0;

    function moveRoomCat(index = null) {
        if (!roomCat) return;

        if (index === null) {
            roomPositionIndex =
                (roomPositionIndex + 1) %
                roomPositions.length;
        } else {
            roomPositionIndex =
                clamp(
                    index,
                    0,
                    roomPositions.length - 1
                );
        }

        const position =
            roomPositions[roomPositionIndex];

        roomCat.setAttribute(
            "transform",
            `translate(${position.x},${position.y})`
        );

        const inner = $(".room__cat-inner", roomCat);

        if (inner) {
            inner.style.transform =
                Math.random() > 0.5
                    ? "scaleX(1)"
                    : "scaleX(-1)";
        }

        roomCat.classList.remove("is-playing");

        requestAnimationFrame(() => {
            roomCat.classList.add("is-playing");

            setTimeout(() => {
                roomCat.classList.remove("is-playing");
            }, 500);
        });
    }

    function startRoomMovement() {
        if (!roomCat) return;

        clearInterval(roomMoveTimer);

        roomMoveTimer = setInterval(() => {
            if (Date.now() < roomPausedUntil) return;

            moveRoomCat();
        }, 4200);
    }

    function pauseRoomMovement(ms = 5000) {
        roomPausedUntil = Date.now() + ms;
    }

    if (roomCat) {
        roomCat.addEventListener("click", (event) => {
            event.stopPropagation();

            pauseRoomMovement(7000);

            const rect = roomCat.getBoundingClientRect();

            createFloatingHeart(
                rect.left + rect.width / 2,
                rect.top + 10
            );

            showRoomMessage("мррр... ♡");

            roomCat.classList.remove("is-playing");

            requestAnimationFrame(() => {
                roomCat.classList.add("is-playing");
            });
        });

        /*
         * Котик стартує з позиції з HTML,
         * після чого починає сам ходити.
         */
        setTimeout(() => {
            moveRoomCat(0);
            startRoomMovement();
        }, 500);
    }

    /* ---------------------------------------------------------
       ROOM OBJECTS
    --------------------------------------------------------- */

    Object.keys(roomMessages).forEach((id) => {
        const object = $(`#${id}`);

        if (!object) return;

        const reactToObject = () => {
            pauseRoomMovement(5500);

            const messages = roomMessages[id];

            const message =
                messages[
                    Math.floor(
                        Math.random() * messages.length
                    )
                ];

            showRoomMessage(message);

            /*
             * Котик реагує на предмет і трохи рухається.
             */
            if (roomCat) {
                roomCat.classList.remove("is-playing");

                requestAnimationFrame(() => {
                    roomCat.classList.add("is-playing");
                });
            }
        };

        object.addEventListener("click", reactToObject);

        object.addEventListener("keydown", (event) => {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                reactToObject();
            }
        });
    });

    /* =========================================================
       WINDOW
    ========================================================= */

    const windowSky = $("#windowSky");
    const windowScenery = $("#windowScenery");

    let nightMode = true;

    function drawWindowScenery() {
        if (!windowScenery) return;

        windowScenery.innerHTML = "";

        if (nightMode) {
            for (let i = 0; i < 12; i++) {
                const star = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                );

                star.setAttribute(
                    "cx",
                    String(82 + Math.random() * 140)
                );

                star.setAttribute(
                    "cy",
                    String(82 + Math.random() * 105)
                );

                star.setAttribute("r", "2");
                star.setAttribute("fill", "#fff");
                star.setAttribute(
                    "opacity",
                    String(0.5 + Math.random() * 0.5)
                );

                windowScenery.appendChild(star);
            }

            const moon = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

            moon.setAttribute("cx", "105");
            moon.setAttribute("cy", "105");
            moon.setAttribute("r", "18");
            moon.setAttribute("fill", "#fff5c7");

            windowScenery.appendChild(moon);
        } else {
            const sun = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

            sun.setAttribute("cx", "195");
            sun.setAttribute("cy", "100");
            sun.setAttribute("r", "22");
            sun.setAttribute("fill", "#ffe6a7");

            windowScenery.appendChild(sun);

            const cloud = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );

            cloud.setAttribute(
                "d",
                "M90 170 C100 150 120 150 132 165 C142 145 175 148 180 170 Z"
            );

            cloud.setAttribute("fill", "#fff");
            cloud.setAttribute("opacity", "0.8");

            windowScenery.appendChild(cloud);
        }
    }

    if (windowSky) {
        windowSky.style.cursor = "pointer";

        windowSky.addEventListener("click", (event) => {
            event.stopPropagation();

            nightMode = !nightMode;

            if (nightMode) {
                windowSky.setAttribute(
                    "fill",
                    "#cfe7ff"
                );

                showRoomMessage(
                    "ніч повернулася 🌙"
                );
            } else {
                windowSky.setAttribute(
                    "fill",
                    "#ffe7b8"
                );

                showRoomMessage(
                    "сонечко виглянуло ☀️"
                );
            }

            drawWindowScenery();
        });
    }

    drawWindowScenery();

    /* =========================================================
       LAMP
    ========================================================= */

    const lampShade = $("#lampShade");
    const lampBulb = $("#lampBulb");
    const lampGlow = $("#lampGlow");

    let lampOn = true;

    function toggleLamp() {
        lampOn = !lampOn;

        if (lampShade) {
            lampShade.setAttribute(
                "opacity",
                lampOn ? "1" : "0.65"
            );
        }

        if (lampBulb) {
            lampBulb.setAttribute(
                "fill",
                lampOn ? "#fff3c4" : "#d5cbd0"
            );
        }

        if (lampGlow) {
            lampGlow.setAttribute(
                "opacity",
                lampOn ? "0.28" : "0"
            );
        }

        showRoomMessage(
            lampOn
                ? "лампа знову світить ✨"
                : "тепер темніше..."
        );
    }

    [lampShade, lampBulb, lampGlow]
        .filter(Boolean)
        .forEach((element) => {
            element.style.cursor = "pointer";

            element.addEventListener(
                "click",
                (event) => {
                    event.stopPropagation();
                    toggleLamp();
                }
            );
        });

    if (lampGlow) {
        lampGlow.setAttribute("opacity", "0.28");
        lampGlow.style.pointerEvents = "none";
    }

    /* =========================================================
       GAMES TABS
    ========================================================= */

    const gameTabs = $$(".games__tab");
    const gamePanels = $$(".game-panel");

    gameTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const game = tab.dataset.game;

            gameTabs.forEach((item) => {
                const active =
                    item === tab;

                item.classList.toggle(
                    "is-active",
                    active
                );

                item.classList.toggle(
                    "active",
                    active
                );

                item.setAttribute(
                    "aria-selected",
                    String(active)
                );
            });

            gamePanels.forEach((panel) => {
                const active =
                    panel.id === `game-${game}`;

                panel.classList.toggle(
                    "is-active",
                    active
                );

                panel.classList.toggle(
                    "active",
                    active
                );
            });
        });
    });

    /* =========================================================
       CATCH THE CAT
    ========================================================= */

    const catchStart = $("#catchStart");
    const catchStage = $("#catchStage");
    const catchCat = $("#catchCat");
    const catchScore = $("#catchScore");
    const catchBest = $("#catchBest");
    const catchTime = $("#catchTime");
    const catchHint = $("#catchHint");

    let catchScoreValue = 0;
    let catchBestValue = Number(
        localStorage.getItem(
            "little-world-catch-best"
        ) || 0
    );

    let catchTimeLeft = 30;
    let catchTimer = null;
    let catchRunning = false;

    if (catchBest) {
        catchBest.textContent =
            String(catchBestValue);
    }

    function moveCatchCat() {
        if (!catchCat || !catchStage) return;

        const stageRect =
            catchStage.getBoundingClientRect();

        const catWidth =
            catchCat.offsetWidth || 70;

        const catHeight =
            catchCat.offsetHeight || 70;

        const maxX = Math.max(
            0,
            stageRect.width - catWidth
        );

        const maxY = Math.max(
            0,
            stageRect.height - catHeight
        );

        catchCat.style.left =
            `${Math.random() * maxX}px`;

        catchCat.style.top =
            `${Math.random() * maxY}px`;
    }

    function finishCatchGame() {
        catchRunning = false;

        clearInterval(catchTimer);
        catchTimer = null;

        if (catchScoreValue > catchBestValue) {
            catchBestValue =
                catchScoreValue;

            localStorage.setItem(
                "little-world-catch-best",
                String(catchBestValue)
            );

            if (catchBest) {
                catchBest.textContent =
                    String(catchBestValue);
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

        fetch("/api/stats/game", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                game: "catch",
                score: catchScoreValue
            })
        }).catch(() => {});
    }

    function startCatchGame() {
        if (!catchStage || !catchCat) return;

        clearInterval(catchTimer);

        catchRunning = true;
        catchScoreValue = 0;
        catchTimeLeft = 30;

        if (catchScore) {
            catchScore.textContent = "0";
        }

        if (catchTime) {
            catchTime.textContent = "30";
        }

        if (catchHint) {
            catchHint.textContent =
                "лови котика! ♡";
        }

        if (catchStart) {
            catchStart.disabled = true;
            catchStart.textContent =
                "гра триває...";
        }

        catchCat.style.display = "block";

        moveCatchCat();

        catchTimer = setInterval(() => {
            catchTimeLeft--;

            if (catchTime) {
                catchTime.textContent =
                    String(catchTimeLeft);
            }

            if (catchTimeLeft <= 0) {
                finishCatchGame();
            }
        }, 1000);
    }

    if (catchStart) {
        catchStart.addEventListener(
            "click",
            startCatchGame
        );
    }

    if (catchCat) {
        catchCat.addEventListener("click", () => {
            if (!catchRunning) return;

            catchScoreValue++;

            if (catchScore) {
                catchScore.textContent =
                    String(catchScoreValue);
            }

            const rect =
                catchCat.getBoundingClientRect();

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

        for (
            let i = result.length - 1;
            i > 0;
            i--
        ) {
            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                result[i],
                result[j]
            ] = [
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
            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "memory-card";
            button.dataset.index =
                String(index);

            if (card.flipped || card.matched) {
                button.classList.add("is-flipped");
                button.classList.add("flipped");
            }

            if (card.matched) {
                button.classList.add("is-matched");
                button.classList.add("matched");
            }

            button.innerHTML = `
                <span class="memory-card__inner">
                    <span class="memory-card__face memory-card__face--back">
                        ?
                    </span>

                    <span class="memory-card__face memory-card__face--front">
                        ${safeText(card.symbol, "🐱")}
                    </span>
                </span>
            `;

            button.addEventListener(
                "click",
                () => handleMemoryClick(index)
            );

            memoryGrid.appendChild(button);
        });
    }

    function startMemoryGame() {
        const doubled = [
            ...memorySymbols,
            ...memorySymbols
        ];

        memoryCards =
            shuffle(doubled).map(
                (symbol) => ({
                    symbol,
                    flipped: false,
                    matched: false
                })
            );

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
            memoryStart.textContent =
                "перемішати";
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

        const card =
            memoryCards[index];

        card.flipped = true;

        if (memoryFirst === null) {
            memoryFirst = index;

            renderMemory();
            return;
        }

        memorySecond = index;
        memoryMovesValue++;

        if (memoryMoves) {
            memoryMoves.textContent =
                String(memoryMovesValue);
        }

        renderMemory();

        const first =
            memoryCards[memoryFirst];

        const second =
            memoryCards[memorySecond];

        if (
            first.symbol ===
            second.symbol
        ) {
            first.matched = true;
            second.matched = true;

            memoryFoundValue++;

            if (memoryFound) {
                memoryFound.textContent =
                    String(memoryFoundValue);
            }

            memoryFirst = null;
            memorySecond = null;

            renderMemory();

            if (
                memoryFoundValue ===
                memorySymbols.length
            ) {
                if (memoryStart) {
                    memoryStart.textContent =
                        "ще раз";
                }

                showToast(
                    "усі котики знайдені! ♡"
                );
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
        }, 750);
    }

    if (memoryStart) {
        memoryStart.addEventListener(
            "click",
            startMemoryGame
        );
    }

    if (memoryGrid) {
        startMemoryGame();
    }

    /* =========================================================
       PET THE CAT GAME
    ========================================================= */

    const petFill = $("#petFill");
    const petReset = $("#petReset");
    const petBigCat = $("#petBigCat");
    const petBigCatFace = $("#petBigCatFace");
    const petHint = $("#petHint");

    let petValue = 0;

    function updatePetGame() {
        if (petFill) {
            petFill.style.width =
                `${petValue}%`;
        }

        if (petHint) {
            if (petValue >= 100) {
                petHint.textContent =
                    "котик повністю щасливий! ♡";
            } else if (petValue >= 75) {
                petHint.textContent =
                    "ще трошки погладь ♡";
            } else if (petValue >= 40) {
                petHint.textContent =
                    "йому подобається!";
            } else {
                petHint.textContent =
                    "клікай на котика ♡";
            }
        }

        if (petBigCatFace) {
            if (petValue >= 100) {
                petBigCatFace.textContent =
                    "😻";
            } else if (petValue >= 60) {
                petBigCatFace.textContent =
                    "😸";
            } else if (petValue >= 30) {
                petBigCatFace.textContent =
                    "😺";
            } else {
                petBigCatFace.textContent =
                    "🐱";
            }
        }
    }

    if (petBigCat) {
        petBigCat.addEventListener("click", () => {
            petValue =
                Math.min(
                    100,
                    petValue + 10
                );

            updatePetGame();

            const rect =
                petBigCat.getBoundingClientRect();

            createFloatingHeart(
                rect.left + rect.width / 2,
                rect.top
            );

            petBigCat.classList.remove(
                "is-petted"
            );

            requestAnimationFrame(() => {
                petBigCat.classList.add(
                    "is-petted"
                );
            });
        });
    }

    if (petReset) {
        petReset.addEventListener(
            "click",
            () => {
                petValue = 0;
                updatePetGame();
            }
        );
    }

    updatePetGame();

    /* =========================================================
       MUSIC PLAYER
       ONLY REAL MUSIC AUDIO.
       NO UI SOUNDS.
    ========================================================= */

    const musicAudio = new Audio();

    musicAudio.preload = "metadata";
    musicAudio.volume = 0.25;

    const playerCover =
        $("#playerCover");

    const playerVisualizer =
        $("#playerVisualizer");

    const vizBars =
        $("#vizBars");

    const playerTrack =
        $("#playerTrack");

    const playerArtist =
        $("#playerArtist");

    const playerTimeCurrent =
        $("#playerTimeCurrent");

    const playerSeek =
        $("#playerSeek");

    const playerTimeTotal =
        $("#playerTimeTotal");

    const playerPrev =
        $("#playerPrev");

    const playerPlay =
        $("#playerPlay");

    const playerNext =
        $("#playerNext");

    const playerSpotify =
        $("#playerSpotify");

    const playerVolume =
        $("#playerVolume");

    const playlist =
        $("#playlist");

    let tracks = [];
    let currentTrackIndex = 0;

    /*
     * Гучність завжди стартує з 25%.
     * Не беремо старе значення localStorage.
     */
    const INITIAL_VOLUME = 0.25;

    musicAudio.volume =
        INITIAL_VOLUME;

    if (playerVolume) {
        playerVolume.min = "0";
        playerVolume.max = "100";
        playerVolume.step = "1";
        playerVolume.value = "25";
    }

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

        const value =
            String(file).trim();

        if (!value) return "";

        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("/")
        ) {
            return value;
        }

        return `/${value.replace(
            /^\.?\//,
            ""
        )}`;
    }

    function normalizeTrack(track) {
        if (
            !track ||
            typeof track !== "object"
        ) {
            return null;
        }

        const file =
            normalizeFile(
                track.file ||
                track.url ||
                track.src ||
                track.path
            );

        if (!file) return null;

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
        } catch (_) {
            return file;
        }
    }

    function createVisualizerBars() {
        if (!vizBars) return;

        vizBars.innerHTML = "";

        const fragment =
            document.createDocumentFragment();

        for (let i = 0; i < 28; i++) {
            const bar =
                document.createElement("span");

            bar.className = "viz-bar";

            bar.style.height =
                `${20 + Math.random() * 60}%`;

            bar.style.animationDelay =
                `${Math.random() * 0.8}s`;

            fragment.appendChild(bar);
        }

        vizBars.appendChild(fragment);
    }

    function renderPlaylist() {
        if (!playlist) return;

        playlist.innerHTML = "";

        tracks.forEach((track, index) => {
            const item =
                document.createElement("li");

            item.className = "music-item";

            if (
                index ===
                currentTrackIndex
            ) {
                item.classList.add(
                    "is-active"
                );
            }

            item.innerHTML = `
                <button
                    type="button"
                    class="music-item__button"
                    aria-label="Відтворити ${safeText(track.title)}"
                >
                    <span class="music-item__number">
                        ${String(index + 1).padStart(2, "0")}
                    </span>

                    <span class="music-item__info">
                        <span class="music-item__title">
                            ${safeText(track.title)}
                        </span>

                        <span class="music-item__artist">
                            ${safeText(track.artist)}
                        </span>
                    </span>

                    <span class="music-item__icon">
                        ${index === currentTrackIndex && !musicAudio.paused
                            ? "Ⅱ"
                            : "▶"}
                    </span>
                </button>
            `;

            const button =
                $(".music-item__button", item);

            if (button) {
                button.addEventListener(
                    "click",
                    () => {
                        if (
                            index ===
                                currentTrackIndex &&
                            !musicAudio.paused
                        ) {
                            pauseMusic();
                        } else {
                            loadTrack(
                                index,
                                true
                            );
                        }
                    }
                );
            }

            playlist.appendChild(item);
        });
    }

    function updatePlayerUI() {
        const track =
            tracks[currentTrackIndex];

        if (!track) return;

        if (playerTrack) {
            playerTrack.textContent =
                track.title;
        }

        if (playerArtist) {
            playerArtist.textContent =
                track.artist;
        }

        if (playerCover) {
            if (track.cover) {
                playerCover.style.backgroundImage =
                    `url("${track.cover}")`;
            } else {
                playerCover.style.backgroundImage =
                    "";
            }
        }

        if (playerSpotify) {
            if (track.spotify) {
                playerSpotify.style.display =
                    "";

                playerSpotify.href =
                    track.spotify;
            } else {
                playerSpotify.style.display =
                    "none";

                playerSpotify.removeAttribute(
                    "href"
                );
            }
        }

        if (playerSeek) {
            playerSeek.value = "0";
        }

        if (playerTimeCurrent) {
            playerTimeCurrent.textContent =
                "0:00";
        }

        if (playerTimeTotal) {
            playerTimeTotal.textContent =
                "0:00";
        }

        renderPlaylist();
    }

    function updatePlayButton() {
        if (!playerPlay) return;

        const playing =
            !musicAudio.paused &&
            !musicAudio.ended;

        playerPlay.textContent =
            playing ? "Ⅱ" : "▶";

        playerPlay.setAttribute(
            "aria-label",
            playing
                ? "Пауза"
                : "Відтворити"
        );

        if (playerVisualizer) {
            playerVisualizer.classList.toggle(
                "playing",
                playing
            );
        }
    }

    function loadTrack(
        index,
        autoplay = false
    ) {
        if (!tracks.length) return;

        index =
            ((index % tracks.length) +
                tracks.length) %
            tracks.length;

        currentTrackIndex = index;

        const track =
            tracks[currentTrackIndex];

        musicAudio.pause();

        musicAudio.removeAttribute(
            "src"
        );

        musicAudio.src =
            getTrackUrl(track.file);

        musicAudio.currentTime = 0;

        updatePlayerUI();
        updatePlayButton();

        try {
            musicAudio.load();
        } catch (error) {
            console.warn(
                "Audio load error:",
                error
            );
        }

        if (autoplay) {
            playMusic();
        }
    }

    async function playMusic() {
        if (!tracks.length) return;

        if (!musicAudio.src) {
            loadTrack(
                currentTrackIndex,
                false
            );
        }

        try {
            await musicAudio.play();
        } catch (error) {
            console.error(
                "Не вдалося запустити музику:",
                error
            );

            showToast(
                "Не вдалося відкрити цей MP3 ♫"
            );
        }

        updatePlayButton();
        renderPlaylist();
    }

    function pauseMusic() {
        musicAudio.pause();
        updatePlayButton();
        renderPlaylist();
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

        const next =
            (currentTrackIndex + 1) %
            tracks.length;

        loadTrack(next, true);
    }

    function previousTrack() {
        if (!tracks.length) return;

        /*
         * Якщо вже прослухано більше 3 секунд —
         * повертаємося на початок цього треку.
         */
        if (
            musicAudio.currentTime > 3
        ) {
            musicAudio.currentTime = 0;
            return;
        }

        const previous =
            (currentTrackIndex -
                1 +
                tracks.length) %
            tracks.length;

        loadTrack(
            previous,
            true
        );
    }

    async function loadMusic() {
        let apiTracks = [];

        try {
            const response =
                await fetch(
                    "/api/music",
                    {
                        cache: "no-store"
                    }
                );

            if (response.ok) {
                const data =
                    await response.json();

                if (Array.isArray(data)) {
                    apiTracks = data;
                } else if (
                    Array.isArray(
                        data.tracks
                    )
                ) {
                    apiTracks =
                        data.tracks;
                }
            }
        } catch (error) {
            console.warn(
                "Music API unavailable."
            );
        }

        tracks =
            apiTracks
                .map(normalizeTrack)
                .filter(Boolean);

        if (!tracks.length) {
            tracks =
                fallbackTracks
                    .map(normalizeTrack)
                    .filter(Boolean);
        }

        createVisualizerBars();

        currentTrackIndex = 0;

        loadTrack(
            currentTrackIndex,
            false
        );

        console.log(
            "♫ Music tracks:",
            tracks.length
        );
    }

    /* ---------------------------------------------------------
       MUSIC EVENTS
    --------------------------------------------------------- */

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
        playerVolume.addEventListener(
            "input",
            () => {
                const value =
                    Number(
                        playerVolume.value
                    );

                const volume =
                    clamp(
                        value / 100,
                        0,
                        1
                    );

                musicAudio.volume =
                    volume;
            }
        );
    }

    if (playerSeek) {
        playerSeek.addEventListener(
            "input",
            () => {
                if (
                    !Number.isFinite(
                        musicAudio.duration
                    ) ||
                    musicAudio.duration <= 0
                ) {
                    return;
                }

                const percent =
                    Number(
                        playerSeek.value
                    ) / 100;

                musicAudio.currentTime =
                    musicAudio.duration *
                    percent;
            }
        );
    }

    musicAudio.addEventListener(
        "loadedmetadata",
        () => {
            if (playerTimeTotal) {
                playerTimeTotal.textContent =
                    formatTime(
                        musicAudio.duration
                    );
            }

            if (playerSeek) {
                playerSeek.value = "0";
            }
        }
    );

    musicAudio.addEventListener(
        "timeupdate",
        () => {
            if (playerTimeCurrent) {
                playerTimeCurrent.textContent =
                    formatTime(
                        musicAudio.currentTime
                    );
            }

            if (
                playerSeek &&
                Number.isFinite(
                    musicAudio.duration
                ) &&
                musicAudio.duration > 0
            ) {
                playerSeek.value =
                    String(
                        (
                            musicAudio.currentTime /
                            musicAudio.duration
                        ) * 100
                    );
            }
        }
    );

    musicAudio.addEventListener(
        "play",
        () => {
            updatePlayButton();
            renderPlaylist();
        }
    );

    musicAudio.addEventListener(
        "pause",
        () => {
            updatePlayButton();
            renderPlaylist();
        }
    );

    musicAudio.addEventListener(
        "ended",
        () => {
            nextTrack();
        }
    );

    musicAudio.addEventListener(
        "error",
        () => {
            console.error(
                "Audio error:",
                musicAudio.error,
                "URL:",
                musicAudio.src
            );

            updatePlayButton();

            showToast(
                "MP3 не завантажився. Перевір файл у public/music."
            );
        }
    );

    loadMusic();

    /* =========================================================
       SCROLL REVEAL
    ========================================================= */

    const revealElements =
        $$(".reveal");

    if (
        "IntersectionObserver" in
        window
    ) {
        const observer =
            new IntersectionObserver(
                (entries) => {
                    entries.forEach(
                        (entry) => {
                            if (
                                entry.isIntersecting
                            ) {
                                entry.target.classList.add(
                                    "visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );
                            }
                        }
                    );
                },
                {
                    threshold: 0.12
                }
            );

        revealElements.forEach(
            (element) => {
                observer.observe(element);
            }
        );
    } else {
        revealElements.forEach(
            (element) => {
                element.classList.add(
                    "visible"
                );
            }
        );
    }

    /* =========================================================
       FINAL INIT
    ========================================================= */

    if (playerVolume) {
        playerVolume.value = "25";
    }

    console.log(
        "♡ little world loaded"
    );
    console.log(
        "♫ Music volume: 25%"
    );
});