document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // =========================================================
    // HELPERS
    // =========================================================

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const safeText = (value, fallback = "") =>
        value == null ? fallback : String(value);

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return "0:00";
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${String(secs).padStart(2, "0")}`;
    };

    const escapeHTML = (value) => {
        return safeText(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // =========================================================
    // TOAST
    // =========================================================

    const toast = $("#toast");
    let toastTimer = null;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    // =========================================================
    // BACKGROUND
    // =========================================================

    const stars = $("#stars");

    if (stars) {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 100; i++) {
            const star = document.createElement("span");

            star.className = "star";
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 4}s`;
            star.style.animationDuration =
                `${2 + Math.random() * 4}s`;

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
            heart.style.animationDuration =
                `${5 + Math.random() * 5}s`;
            heart.style.fontSize =
                `${12 + Math.random() * 22}px`;

            fragment.appendChild(heart);
        }

        heroHearts.appendChild(fragment);
    }

    // =========================================================
    // FLOATING HEART
    // =========================================================

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

    // =========================================================
    // NAVIGATION
    // =========================================================

    const navBurger = $("#navBurger");
    const navLinks = $("#navLinks");

    if (navBurger && navLinks) {
        navBurger.addEventListener("click", () => {
            const isOpen =
                navBurger.classList.toggle("is-open");

            navLinks.classList.toggle("is-open", isOpen);
            navBurger.classList.toggle("active", isOpen);
            navLinks.classList.toggle("active", isOpen);

            navBurger.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        $$(".nav__link", navLinks).forEach((link) => {
            link.addEventListener("click", () => {
                navBurger.classList.remove(
                    "is-open",
                    "active"
                );

                navLinks.classList.remove(
                    "is-open",
                    "active"
                );

                navBurger.setAttribute(
                    "aria-expanded",
                    "false"
                );
            });
        });
    }

    // =========================================================
    // CATS
    // =========================================================

    const catsGrid = $("#catsGrid");

    const fallbackCats = [
        {
            id: 1,
            name: "Milo",
            emoji: "🐱",
            description: "маленький сонний пухнастик",
            personality: "сонний",
            favorite: "дрімати"
        },
        {
            id: 2,
            name: "Luna",
            emoji: "🐈",
            description: "нічна принцеса",
            personality: "спокійна",
            favorite: "дивитися на зорі"
        },
        {
            id: 3,
            name: "Mochi",
            emoji: "😺",
            description: "найніжніший котик",
            personality: "ніжний",
            favorite: "обійми"
        },
        {
            id: 4,
            name: "Neko",
            emoji: "😸",
            description: "маленький бешкетник",
            personality: "граційний",
            favorite: "іграшки"
        },
        {
            id: 5,
            name: "Mimi",
            emoji: "😽",
            description: "маленька мрійниця",
            personality: "мрійлива",
            favorite: "сонечко"
        }
    ];

    let cats = [];

    function createCatHeart(container) {
        if (!container) return;

        const heart = document.createElement("span");

        heart.className = "pet-heart";
        heart.textContent = "♡";

        heart.style.setProperty(
            "--heart-x",
            `${-35 + Math.random() * 70}px`
        );

        container.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1100);
    }

    async function petCat(cat, button) {
        if (!button) return;

        const card = button.closest(".cat-card");
        const hearts = $(".cat-card__hearts", card);

        button.disabled = true;

        if (card) {
            card.classList.remove("is-petted");

            requestAnimationFrame(() => {
                card.classList.add("is-petted");
            });
        }

        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                createCatHeart(hearts);
            }, i * 100);
        }

        const rect = button.getBoundingClientRect();

        createFloatingHeart(
            rect.left + rect.width / 2,
            rect.top
        );

        const reaction = $(".cat-card__reaction", card);

        if (reaction) {
            const reactions = [
                "мррр... ♡",
                "йому подобається!",
                "ще раз ♡",
                "мур-мур ✨",
                "який хороший котик!"
            ];

            reaction.textContent =
                reactions[
                    Math.floor(
                        Math.random() * reactions.length
                    )
                ];

            reaction.classList.add("show");
        }

        setTimeout(() => {
            button.disabled = false;
        }, 500);

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
        } catch {
            // Optional statistics.
        }
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

            const name =
                escapeHTML(cat.name || "Kitty");

            const emoji =
                escapeHTML(cat.emoji || "🐱");

            const description =
                escapeHTML(
                    cat.description ||
                    cat.personality ||
                    "маленький пухнастик"
                );

            const personality =
                escapeHTML(cat.personality || "");

            const favorite =
                escapeHTML(cat.favorite || "");

            card.innerHTML = `
                <div class="cat-card__portrait">
                    <span class="cat-card__emoji">
                        ${emoji}
                    </span>
                </div>

                <div class="cat-card__body">
                    <h3 class="cat-card__name">
                        ${name}
                    </h3>

                    <p class="cat-card__personality">
                        ${description}
                    </p>

                    ${
                        personality
                            ? `
                                <p class="cat-card__favorite">
                                    ${personality}
                                </p>
                            `
                            : ""
                    }

                    ${
                        favorite
                            ? `
                                <p class="cat-card__favorite">
                                    ♡ ${favorite}
                                </p>
                            `
                            : ""
                    }

                    <button
                        class="cat-card__pet-btn cat-card__button"
                        type="button"
                    >
                        погладити ♡
                    </button>

                    <p class="cat-card__reaction">
                        мррр... ♡
                    </p>
                </div>

                <div
                    class="cat-card__hearts"
                    aria-hidden="true"
                ></div>
            `;

            const button =
                $(".cat-card__pet-btn", card);

            if (button) {
                button.addEventListener("click", () => {
                    petCat(cat, button);
                });
            }

            catsGrid.appendChild(card);
        });
    }

    async function loadCats() {
        try {
            const response =
                await fetch("/api/cats", {
                    cache: "no-store"
                });

            if (!response.ok) {
                throw new Error("Cats API failed");
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
        } catch {
            cats = fallbackCats;
        }

        renderCats();
    }

    loadCats();

    // =========================================================
    // ROOM
    // =========================================================

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
            "іграшка покотилася!"
        ],

        "obj-bowl": [
            "мисочка порожня...",
            "котик явно натякає на вечерю",
            "ще одну смакоту? ♡"
        ]
    };

    const roomPositions = {
        "obj-window": [250, 300],
        "obj-lamp": [400, 300],
        "obj-plant": [650, 300],
        "obj-bed": [520, 315],
        "obj-toy": [390, 350],
        "obj-bowl": [560, 350]
    };

    function showRoomMessage(message) {
        if (!roomCaption) return;

        roomCaption.textContent = message;
        roomCaption.classList.remove("show");

        requestAnimationFrame(() => {
            roomCaption.classList.add("show");
        });
    }

    function moveRoomCat(id) {
        if (!roomCat) return;

        const position = roomPositions[id];

        if (!position) return;

        roomCat.style.transform =
            `translate(${position[0]}px, ${position[1]}px)`;

        roomCat.classList.remove("is-playing");

        requestAnimationFrame(() => {
            roomCat.classList.add("is-playing");

            setTimeout(() => {
                roomCat.classList.remove("is-playing");
            }, 600);
        });
    }

    Object.keys(roomMessages).forEach((id) => {
        const object = $(`#${id}`);

        if (!object) return;

        object.addEventListener("click", () => {
            const messages = roomMessages[id];

            const message =
                messages[
                    Math.floor(
                        Math.random() * messages.length
                    )
                ];

            showRoomMessage(message);
            moveRoomCat(id);
        });

        object.addEventListener("keydown", (event) => {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                object.click();
            }
        });
    });

    if (roomCat) {
        roomCat.addEventListener("click", () => {
            const rect =
                roomCat.getBoundingClientRect();

            createFloatingHeart(
                rect.left + rect.width / 2,
                rect.top + 10
            );

            showRoomMessage("мррр... ♡");

            roomCat.classList.remove("is-playing");

            requestAnimationFrame(() => {
                roomCat.classList.add("is-playing");

                setTimeout(() => {
                    roomCat.classList.remove(
                        "is-playing"
                    );
                }, 600);
            });
        });
    }

    // =========================================================
    // WINDOW
    // =========================================================

    const objWindow = $("#obj-window");
    const windowSky = $("#windowSky");
    const windowScenery = $("#windowScenery");

    let nightMode = true;

    function updateWindow() {
        if (windowSky) {
            windowSky.classList.toggle(
                "day",
                !nightMode
            );
        }

        if (windowScenery) {
            windowScenery.classList.toggle(
                "day",
                !nightMode
            );

            windowScenery.innerHTML = nightMode
                ? `
                    <circle
                        cx="190"
                        cy="95"
                        r="18"
                        fill="#fff3c4"
                    />

                    <circle
                        cx="110"
                        cy="110"
                        r="2"
                        fill="#ffffff"
                    />

                    <circle
                        cx="145"
                        cy="90"
                        r="2"
                        fill="#ffffff"
                    />

                    <circle
                        cx="175"
                        cy="135"
                        r="2"
                        fill="#ffffff"
                    />

                    <circle
                        cx="100"
                        cy="155"
                        r="2"
                        fill="#ffffff"
                    />

                    <circle
                        cx="205"
                        cy="155"
                        r="2"
                        fill="#ffffff"
                    />
                `
                : `
                    <circle
                        cx="190"
                        cy="100"
                        r="22"
                        fill="#fff3a8"
                    />

                    <path
                        d="
                            M70 185
                            C100 165 120 175 145 165
                            C175 150 195 175 230 150
                            L230 200
                            L70 200 Z
                        "
                        fill="#b6dcc2"
                    />

                    <circle
                        cx="105"
                        cy="125"
                        r="8"
                        fill="#ffffff"
                        opacity="0.7"
                    />

                    <circle
                        cx="125"
                        cy="115"
                        r="11"
                        fill="#ffffff"
                        opacity="0.7"
                    />
                `;
        }
    }

    if (objWindow) {
        objWindow.addEventListener("click", () => {
            nightMode = !nightMode;

            updateWindow();

            showRoomMessage(
                nightMode
                    ? "ніч повернулася 🌙"
                    : "сонечко виглянуло ☀️"
            );
        });
    }

    updateWindow();

    // =========================================================
    // LAMP
    // =========================================================

    const objLamp = $("#obj-lamp");
    const lampShade = $("#lampShade");
    const lampBulb = $("#lampBulb");
    const lampGlow = $("#lampGlow");

    let lampOn = true;

    function updateLamp() {
        if (lampShade) {
            lampShade.style.opacity =
                lampOn ? "1" : "0.45";
        }

        if (lampBulb) {
            lampBulb.style.opacity =
                lampOn ? "1" : "0.35";
        }

        if (lampGlow) {
            lampGlow.style.opacity =
                lampOn ? "0.35" : "0";
        }
    }

    if (objLamp) {
        objLamp.addEventListener("click", () => {
            lampOn = !lampOn;

            updateLamp();

            showRoomMessage(
                lampOn
                    ? "лампа знову світить ✨"
                    : "тепер темніше..."
            );
        });
    }

    updateLamp();

    // =========================================================
    // GAMES — TABS
    // =========================================================

    const gameTabs = $$(".games__tab");

    gameTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const game = tab.dataset.game;

            gameTabs.forEach((item) => {
                const active = item === tab;

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

            $$(".game-panel").forEach((panel) => {
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

    // =========================================================
    // CATCH THE CAT
    // =========================================================

    const catchStart = $("#catchStart");
    const catchStage = $("#catchStage");
    const catchCat = $("#catchCat");
    const catchScore = $("#catchScore");
    const catchBest = $("#catchBest");
    const catchTime = $("#catchTime");
    const catchHint = $("#catchHint");

    let catchScoreValue = 0;
    let catchTimeLeft = 30;
    let catchTimer = null;
    let catchRunning = false;

    let catchBestValue =
        Number(
            localStorage.getItem(
                "little-world-catch-best"
            ) || 0
        );

    if (!Number.isFinite(catchBestValue)) {
        catchBestValue = 0;
    }

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

        const maxX =
            Math.max(
                0,
                stageRect.width - catWidth
            );

        const maxY =
            Math.max(
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

        if (catchTimer) {
            clearInterval(catchTimer);
            catchTimer = null;
        }

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

        if (catchTimer) {
            clearInterval(catchTimer);
            catchTimer = null;
        }

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
            catchStart.disabled = false;
            catchStart.textContent = "граєш...";
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

    // =========================================================
    // MEMORY
    // =========================================================

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
            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [result[i], result[j]] =
                [result[j], result[i]];
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

            button.innerHTML = `
                <span class="memory-card__inner">
                    <span
                        class="
                            memory-card__face
                            memory-card__face--front
                        "
                    >
                        ?
                    </span>

                    <span
                        class="
                            memory-card__face
                            memory-card__face--back
                        "
                    >
                        ${escapeHTML(card.symbol)}
                    </span>
                </span>
            `;

            if (card.flipped || card.matched) {
                button.classList.add(
                    "is-flipped",
                    "flipped"
                );
            }

            if (card.matched) {
                button.classList.add(
                    "is-matched",
                    "matched"
                );
            }

            button.addEventListener("click", () => {
                handleMemoryClick(index);
            });

            memoryGrid.appendChild(button);
        });
    }

    function startMemoryGame() {
        const doubled = [
            ...memorySymbols,
            ...memorySymbols
        ];

        memoryCards =
            shuffle(doubled).map((symbol) => ({
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

        if (first.symbol === second.symbol) {
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

                fetch("/api/stats/game", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        game: "memory",
                        score: memoryFoundValue
                    })
                }).catch(() => {});
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

    // =========================================================
    // PET THE CAT GAME
    // =========================================================

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
                    "погладь котика ♡";
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
            petValue =
                Math.min(100, petValue + 10);

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

                setTimeout(() => {
                    petBigCat.classList.remove(
                        "is-petted"
                    );
                }, 500);
            });
        });
    }

    if (petReset) {
        petReset.addEventListener("click", () => {
            petValue = 0;
            updatePetGame();
        });
    }

    updatePetGame();

    // =========================================================
    // MUSIC PLAYER
    // =========================================================

    const musicAudio = new Audio();

    musicAudio.preload = "metadata";
    musicAudio.volume = 0.25;

    const playerCover = $("#playerCover");
    const playerVisualizer = $("#playerVisualizer");
    const vizBars = $("#vizBars");

    const playerTrack = $("#playerTrack");
    const playerArtist = $("#playerArtist");

    const playerTimeCurrent =
        $("#playerTimeCurrent");

    const playerSeek = $("#playerSeek");

    const playerTimeTotal =
        $("#playerTimeTotal");

    const playerPrev = $("#playerPrev");
    const playerPlay = $("#playerPlay");
    const playerNext = $("#playerNext");

    const playerSpotify =
        $("#playerSpotify");

    const playerVolume =
        $("#playerVolume");

    const playlist = $("#playlist");

    let tracks = [];
    let currentTrackIndex = 0;

    // =========================================================
    // VOLUME
    // =========================================================

    let savedVolumePercent =
        Number(
            localStorage.getItem(
                "little-world-volume-percent"
            )
        );

    if (
        !Number.isFinite(savedVolumePercent) ||
        savedVolumePercent < 0 ||
        savedVolumePercent > 100
    ) {
        savedVolumePercent = 25;
    }

    musicAudio.volume =
        savedVolumePercent / 100;

    if (playerVolume) {
        playerVolume.min = "0";
        playerVolume.max = "100";
        playerVolume.step = "1";
        playerVolume.value =
            String(savedVolumePercent);
    }

    // =========================================================
    // FALLBACK MUSIC
    // =========================================================

    const fallbackTracks = [
        {
            title: "Charisma",
            artist: "Jann",
            file: "/music/Jann - Charisma.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Emperor's New Clothes",
            artist: "Jann",
            file:
                "/music/Jann - Emperor's New Clothes.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Gladiator",
            artist: "Jann",
            file:
                "/music/Jann - Gladiator.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Lookatme",
            artist: "Jann",
            file:
                "/music/Jann - Lookatme.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Need A Break",
            artist: "Jann",
            file:
                "/music/Jann - Need A Break.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Promise",
            artist: "Jann",
            file:
                "/music/Jann - Promise.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Smile",
            artist: "Jann",
            file:
                "/music/Jann - Smile.mp3",
            cover: "",
            spotify: ""
        },
        {
            title: "Kisskiss",
            artist: "Jann",
            file:
                "/music/Jann Kisskiss.mp3",
            cover: "",
            spotify: ""
        }
    ];

    // =========================================================
    // MUSIC PATH NORMALIZER
    // =========================================================

    function normalizeFile(file) {
        if (!file) return "";

        let value = String(file).trim();

        if (!value) return "";

        // External URL
        if (
            value.startsWith("http://") ||
            value.startsWith("https://")
        ) {
            return value;
        }

        // Windows "\" -> "/"
        value = value.replace(/\\/g, "/");

        // Remove file://
        value = value.replace(
            /^file:\/\/\/?/i,
            ""
        );

        // Handle Windows local path:
        // C:/Users/.../public/music/file.mp3
        const publicIndex =
            value.toLowerCase().indexOf(
                "/public/"
            );

        if (publicIndex !== -1) {
            value =
                value.substring(
                    publicIndex +
                    "/public".length
                );
        }

        // Handle paths without /public/
        value = value.replace(
            /^.*\/public\//i,
            ""
        );

        // Remove ./ and leading /
        value = value.replace(
            /^\.\/+/,
            ""
        );

        value = value.replace(
            /^\/+/,
            ""
        );

        // If API says public/music/...
        value = value.replace(
            /^public\/music\//i,
            "music/"
        );

        // If API only contains filename
        if (
            !value
                .toLowerCase()
                .startsWith("music/")
        ) {
            value = `music/${value}`;
        }

        // Encode each URL part safely
        const parts =
            value
                .split("/")
                .map((part) => {
                    try {
                        return encodeURIComponent(
                            decodeURIComponent(part)
                        );
                    } catch {
                        return encodeURIComponent(
                            part
                        );
                    }
                });

        return `/${parts.join("/")}`;
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
        } catch {
            return file;
        }
    }

    // =========================================================
    // VISUALIZER
    // =========================================================

    function createVisualizerBars() {
        if (!vizBars) return;

        if (vizBars.children.length) {
            return;
        }

        const fragment =
            document.createDocumentFragment();

        for (let i = 0; i < 28; i++) {
            const bar =
                document.createElement("rect");

            const angle =
                (360 / 28) * i;

            const radians =
                angle * Math.PI / 180;

            const centerX = 60;
            const centerY = 60;
            const radius = 38;

            const x =
                centerX +
                Math.cos(radians) * radius;

            const y =
                centerY +
                Math.sin(radians) * radius;

            bar.setAttribute(
                "x",
                String(x - 1)
            );

            bar.setAttribute(
                "y",
                String(y - 5)
            );

            bar.setAttribute(
                "width",
                "2"
            );

            bar.setAttribute(
                "height",
                String(
                    8 + Math.random() * 12
                )
            );

            bar.setAttribute(
                "rx",
                "1"
            );

            bar.classList.add("viz-bar");

            fragment.appendChild(bar);
        }

        vizBars.appendChild(fragment);
    }

    // =========================================================
    // PLAYLIST
    // =========================================================

    function renderPlaylist() {
        if (!playlist) return;

        playlist.innerHTML = "";

        tracks.forEach((track, index) => {
            const item =
                document.createElement("li");

            item.className = "music-item";

            if (
                index === currentTrackIndex
            ) {
                item.classList.add(
                    "is-active"
                );
            }

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "music-item__button";

            button.innerHTML = `
                <span class="music-item__number">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <span class="music-item__info">
                    <span class="music-item__title">
                        ${escapeHTML(track.title)}
                    </span>

                    <span class="music-item__artist">
                        ${escapeHTML(track.artist)}
                    </span>
                </span>

                <span class="music-item__icon">
                    ${
                        index === currentTrackIndex &&
                        !musicAudio.paused
                            ? "Ⅱ"
                            : "▶"
                    }
                </span>
            `;

            button.addEventListener(
                "click",
                () => {
                    if (
                        index === currentTrackIndex &&
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

            item.appendChild(button);
            playlist.appendChild(item);
        });
    }

    // =========================================================
    // PLAYER UI
    // =========================================================

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

                playerSpotify.target =
                    "_blank";

                playerSpotify.rel =
                    "noopener noreferrer";
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
        if (playerPlay) {
            playerPlay.textContent =
                musicAudio.paused
                    ? "▶"
                    : "Ⅱ";

            playerPlay.setAttribute(
                "aria-label",
                musicAudio.paused
                    ? "Відтворити"
                    : "Пауза"
            );
        }

        if (playerVisualizer) {
            playerVisualizer.classList.toggle(
                "playing",
                !musicAudio.paused
            );

            playerVisualizer.classList.toggle(
                "is-playing",
                !musicAudio.paused
            );
        }

        renderPlaylist();
    }

    // =========================================================
    // LOAD TRACK
    // =========================================================

    function loadTrack(
        index,
        autoplay = false
    ) {
        if (!tracks.length) return;

        if (index < 0) {
            index =
                tracks.length - 1;
        }

        if (index >= tracks.length) {
            index = 0;
        }

        currentTrackIndex = index;

        const track =
            tracks[currentTrackIndex];

        const url =
            getTrackUrl(track.file);

        console.log(
            "Loading music:",
            track.title,
            url
        );

        musicAudio.pause();

        musicAudio.removeAttribute("src");

        musicAudio.load();

        musicAudio.src = url;

        musicAudio.currentTime = 0;

        updatePlayerUI();
        updatePlayButton();

        try {
            musicAudio.load();
        } catch (error) {
            console.error(
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

            updatePlayButton();
        } catch (error) {
            console.error(
                "Music playback failed:",
                error
            );

            console.error(
                "Current audio URL:",
                musicAudio.currentSrc ||
                musicAudio.src
            );

            updatePlayButton();

            showToast(
                "Не вдалося відтворити трек"
            );
        }
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
            (
                currentTrackIndex + 1
            ) % tracks.length;

        loadTrack(
            nextIndex,
            true
        );
    }

    function previousTrack() {
        if (!tracks.length) return;

        const previousIndex =
            (
                currentTrackIndex -
                1 +
                tracks.length
            ) % tracks.length;

        loadTrack(
            previousIndex,
            true
        );
    }

    // =========================================================
    // LOAD MUSIC FROM API
    // =========================================================

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
                    Array.isArray(data.tracks)
                ) {
                    apiTracks = data.tracks;
                }
            }
        } catch (error) {
            console.warn(
                "Music API unavailable. Using fallback."
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

        // If API returned tracks, but their paths
        // are malformed, use our known local files.
        const invalidLocalPath =
            tracks.some(
                (track) =>
                    !track.file ||
                    (
                        !track.file.startsWith(
                            "http://"
                        ) &&
                        !track.file.startsWith(
                            "https://"
                        ) &&
                        !track.file.startsWith(
                            "/music/"
                        )
                    )
            );

        if (invalidLocalPath) {
            console.warn(
                "Invalid music paths from API. Using fallback tracks."
            );

            tracks =
                fallbackTracks
                    .map(normalizeTrack)
                    .filter(Boolean);
        }

        createVisualizerBars();

        currentTrackIndex = 0;

        renderPlaylist();

        loadTrack(
            currentTrackIndex,
            false
        );

        console.log(
            "Music tracks:",
            tracks.length
        );

        console.table(
            tracks.map((track) => ({
                title: track.title,
                artist: track.artist,
                file: track.file,
                url: getTrackUrl(track.file)
            }))
        );
    }

    // =========================================================
    // PLAYER EVENTS
    // =========================================================

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
                const percent =
                    Number(
                        playerVolume.value
                    );

                const safePercent =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            Number.isFinite(percent)
                                ? percent
                                : 25
                        )
                    );

                musicAudio.volume =
                    safePercent / 100;

                localStorage.setItem(
                    "little-world-volume-percent",
                    String(safePercent)
                );
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
        }
    );

    musicAudio.addEventListener(
        "pause",
        () => {
            updatePlayButton();
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
                "Audio element error:",
                musicAudio.error
            );

            console.error(
                "Failed audio URL:",
                musicAudio.currentSrc ||
                musicAudio.src
            );

            updatePlayButton();
        }
    );

    // =========================================================
    // START MUSIC SYSTEM
    // =========================================================

    loadMusic();

    // =========================================================
    // SCROLL REVEAL
    // =========================================================

    const revealElements =
        $$(".reveal");

    if (
        revealElements.length &&
        "IntersectionObserver" in window
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
                                    "is-visible"
                                );

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
                    "is-visible",
                    "visible"
                );
            }
        );
    }

    // =========================================================
    // INITIAL STATE
    // =========================================================

    if (playerVolume) {
        playerVolume.value =
            String(savedVolumePercent);
    }

    console.log("♡ little world loaded");

    console.log(
        "Initial music volume:",
        `${savedVolumePercent}%`
    );
});