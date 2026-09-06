```javascript
document.addEventListener("DOMContentLoaded", () => {
    // =========================================================
    // LITTLE WORLD ♡
    // Music + cats + room + mini games
    // The ONLY sound on the website is music.
    // =========================================================

    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

    // =========================================================
    // BASIC HELPERS
    // =========================================================

    const safeText = (value, fallback = "") => {
        return value === undefined || value === null ? fallback : String(value);
    };

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds)) return "0:00";

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${String(secs).padStart(2, "0")}`;
    };

    // =========================================================
    // BACKGROUND
    // =========================================================

    function createStars() {
        const stars = $("#stars");
        if (!stars) return;

        stars.innerHTML = "";

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 90; i++) {
            const star = document.createElement("span");

            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            star.style.animationDuration = `${2 + Math.random() * 4}s`;

            fragment.appendChild(star);
        }

        stars.appendChild(fragment);
    }

    function createHeroHearts() {
        const container = $("#heroHearts");
        if (!container) return;

        container.innerHTML = "";

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 18; i++) {
            const heart = document.createElement("span");

            heart.textContent = "♡";
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.top = `${Math.random() * 100}%`;
            heart.style.animationDelay = `${Math.random() * 6}s`;
            heart.style.animationDuration = `${5 + Math.random() * 5}s`;

            fragment.appendChild(heart);
        }

        container.appendChild(fragment);
    }

    createStars();
    createHeroHearts();

    // =========================================================
    // NAVIGATION
    // =========================================================

    const navBurger = $("#navBurger");
    const navLinks = $("#navLinks");

    if (navBurger && navLinks) {
        navBurger.addEventListener("click", () => {
            navLinks.classList.toggle("is-open");
            navBurger.classList.toggle("is-open");
        });

        $$(".nav__link").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("is-open");
                navBurger.classList.remove("is-open");
            });
        });
    }

    // =========================================================
    // CATS
    // =========================================================

    const catsGrid = $("#catsGrid");

    async function loadCats() {
        if (!catsGrid) return;

        try {
            const response = await fetch("/api/cats", {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(`Cats API error: ${response.status}`);
            }

            const cats = await response.json();

            if (!Array.isArray(cats)) return;

            catsGrid.innerHTML = "";

            cats.forEach((cat, index) => {
                const article = document.createElement("article");
                article.className = "cat-card";

                const name = safeText(cat.name, `Cat ${index + 1}`);
                const description = safeText(
                    cat.description,
                    "A very cute little cat ♡"
                );

                const emoji = safeText(cat.emoji, "🐱");

                article.innerHTML = `
                    <div class="cat-card__image">
                        ${
                            cat.image
                                ? `<img src="${cat.image}" alt="${name}" loading="lazy">`
                                : `<div class="cat-card__emoji">${emoji}</div>`
                        }
                    </div>

                    <div class="cat-card__content">
                        <h3>${name}</h3>
                        <p>${description}</p>

                        <button class="cat-card__button" type="button">
                            Pet ♡
                        </button>
                    </div>
                `;

                const button = $(".cat-card__button", article);

                if (button) {
                    button.addEventListener("click", () => {
                        button.classList.add("is-petted");

                        setTimeout(() => {
                            button.classList.remove("is-petted");
                        }, 450);

                        showFloatingHeart(button);
                    });
                }

                catsGrid.appendChild(article);
            });
        } catch (error) {
            console.warn("Could not load cats:", error);
        }
    }

    function showFloatingHeart(element) {
        const heart = document.createElement("span");

        heart.textContent = "♡";
        heart.style.position = "fixed";
        heart.style.pointerEvents = "none";
        heart.style.zIndex = "9999";

        const rect = element.getBoundingClientRect();

        heart.style.left = `${rect.left + rect.width / 2}px`;
        heart.style.top = `${rect.top}px`;
        heart.style.fontSize = "24px";

        document.body.appendChild(heart);

        heart.animate(
            [
                {
                    transform: "translate(-50%, 0) scale(.8)",
                    opacity: 1
                },
                {
                    transform: "translate(-50%, -70px) scale(1.3)",
                    opacity: 0
                }
            ],
            {
                duration: 700,
                easing: "ease-out"
            }
        ).finished.then(() => heart.remove());
    }

    loadCats();

    // =========================================================
    // ROOM
    // =========================================================

    const roomCaption = $("#roomCaption");

    const roomMessages = {
        window: "The world outside looks soft today ♡",
        lamp: "A little light makes everything cozier.",
        plant: "The plant is doing its best 🌱",
        bed: "Definitely the comfiest place here.",
        toy: "Someone forgot their favorite toy.",
        bowl: "Someone has been here recently..."
    };

    function setRoomCaption(text) {
        if (!roomCaption) return;

        roomCaption.textContent = text;

        roomCaption.animate(
            [
                { opacity: 0.35 },
                { opacity: 1 }
            ],
            {
                duration: 300,
                easing: "ease-out"
            }
        );
    }

    Object.entries(roomMessages).forEach(([object, message]) => {
        const element = $(`#obj-${object}`);

        if (!element) return;

        element.style.cursor = "pointer";

        element.addEventListener("click", () => {
            setRoomCaption(message);
        });
    });

    // =========================================================
    // ROOM CAT
    // =========================================================

    const roomCat = $("#roomCat");

    if (roomCat) {
        roomCat.addEventListener("click", () => {
            roomCat.classList.add("is-happy");

            if (roomCaption) {
                setRoomCaption("The little cat is very happy ♡");
            }

            setTimeout(() => {
                roomCat.classList.remove("is-happy");
            }, 700);
        });
    }

    // =========================================================
    // GAMES TABS
    // =========================================================

    const gameTabs = $$(".games__tab");

    gameTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const gameName = tab.dataset.game;

            gameTabs.forEach(item => {
                item.classList.remove("is-active");
            });

            tab.classList.add("is-active");

            $$(".game-panel").forEach(panel => {
                panel.classList.remove("is-active");
            });

            const target = $(`#game-${gameName}`);

            if (target) {
                target.classList.add("is-active");
            }
        });
    });

    // =========================================================
    // CATCH GAME
    // =========================================================

    const catchStart = $("#catchStart");
    const catchStage = $("#catchStage");
    const catchCat = $("#catchCat");
    const catchScore = $("#catchScore");
    const catchBest = $("#catchBest");
    const catchTime = $("#catchTime");
    const catchHint = $("#catchHint");

    let catchScoreValue = 0;
    let catchBestValue = Number(localStorage.getItem("little-world-catch-best") || 0);
    let catchTimeValue = 15;
    let catchTimer = null;
    let catchRunning = false;

    if (catchBest) {
        catchBest.textContent = catchBestValue;
    }

    function moveCatchCat() {
        if (!catchCat || !catchStage) return;

        const stageRect = catchStage.getBoundingClientRect();

        const maxX = Math.max(20, stageRect.width - 100);
        const maxY = Math.max(20, stageRect.height - 100);

        catchCat.style.left = `${Math.random() * maxX}px`;
        catchCat.style.top = `${Math.random() * maxY}px`;
    }

    function stopCatchGame() {
        catchRunning = false;

        if (catchTimer) {
            clearInterval(catchTimer);
            catchTimer = null;
        }

        if (catchHint) {
            catchHint.textContent = "Nice! Press start to play again ♡";
        }

        if (catchScoreValue > catchBestValue) {
            catchBestValue = catchScoreValue;
            localStorage.setItem(
                "little-world-catch-best",
                String(catchBestValue)
            );

            if (catchBest) {
                catchBest.textContent = catchBestValue;
            }
        }
    }

    function startCatchGame() {
        if (!catchStage || !catchCat) return;

        catchRunning = true;
        catchScoreValue = 0;
        catchTimeValue = 15;

        if (catchScore) catchScore.textContent = "0";
        if (catchTime) catchTime.textContent = "15";
        if (catchHint) catchHint.textContent = "Catch the cat! ♡";

        moveCatchCat();

        if (catchTimer) {
            clearInterval(catchTimer);
        }

        catchTimer = setInterval(() => {
            catchTimeValue--;

            if (catchTime) {
                catchTime.textContent = String(catchTimeValue);
            }

            if (catchTimeValue <= 0) {
                stopCatchGame();
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

            moveCatchCat();
        });
    }

    // =========================================================
    // MEMORY GAME
    // =========================================================

    const memoryStart = $("#memoryStart");
    const memoryGrid = $("#memoryGrid");
    const memoryMoves = $("#memoryMoves");
    const memoryFound = $("#memoryFound");

    const memorySymbols = ["🐱", "🐶", "🐰", "🦊", "🐻", "🐼"];

    let memoryCards = [];
    let memoryFirst = null;
    let memoryLocked = false;
    let memoryMovesValue = 0;
    let memoryFoundValue = 0;

    function shuffle(array) {
        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }

    function startMemoryGame() {
        if (!memoryGrid) return;

        memoryFirst = null;
        memoryLocked = false;
        memoryMovesValue = 0;
        memoryFoundValue = 0;

        if (memoryMoves) memoryMoves.textContent = "0";
        if (memoryFound) memoryFound.textContent = "0";

        const deck = shuffle([...memorySymbols, ...memorySymbols]);

        memoryGrid.innerHTML = "";

        deck.forEach((symbol, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "memory-card";
            button.dataset.index = String(index);
            button.dataset.symbol = symbol;

            button.innerHTML = `
                <span class="memory-card__front">♡</span>
                <span class="memory-card__back">${symbol}</span>
            `;

            button.addEventListener("click", () => handleMemoryCard(button));

            memoryGrid.appendChild(button);
        });

        memoryCards = $$(".memory-card", memoryGrid);
    }

    function handleMemoryCard(card) {
        if (memoryLocked) return;
        if (card.classList.contains("is-open")) return;
        if (card.classList.contains("is-found")) return;

        card.classList.add("is-open");

        if (!memoryFirst) {
            memoryFirst = card;
            return;
        }

        memoryMovesValue++;

        if (memoryMoves) {
            memoryMoves.textContent = String(memoryMovesValue);
        }

        const second = card;

        if (memoryFirst.dataset.symbol === second.dataset.symbol) {
            memoryFirst.classList.add("is-found");
            second.classList.add("is-found");

            memoryFoundValue++;

            if (memoryFound) {
                memoryFound.textContent = String(memoryFoundValue);
            }

            memoryFirst = null;

            if (memoryFoundValue === memorySymbols.length) {
                setTimeout(() => {
                    if (memoryMoves) {
                        memoryMoves.textContent = `${memoryMovesValue} ♡`;
                    }
                }, 300);
            }

            return;
        }

        memoryLocked = true;

        setTimeout(() => {
            memoryFirst.classList.remove("is-open");
            second.classList.remove("is-open");

            memoryFirst = null;
            memoryLocked = false;
        }, 650);
    }

    if (memoryStart) {
        memoryStart.addEventListener("click", startMemoryGame);
    }

    // =========================================================
    // PET GAME
    // =========================================================

    const petFill = $("#petFill");
    const petReset = $("#petReset");
    const petBigCat = $("#petBigCat");
    const petBigCatFace = $("#petBigCatFace");
    const petHint = $("#petHint");

    let petValue = 0;

    function updatePetGame() {
        petValue = Math.max(0, Math.min(100, petValue));

        if (petFill) {
            petFill.style.width = `${petValue}%`;
        }

        if (petBigCatFace) {
            if (petValue >= 80) {
                petBigCatFace.textContent = "😸";
            } else if (petValue >= 45) {
                petBigCatFace.textContent = "😺";
            } else {
                petBigCatFace.textContent = "🐱";
            }
        }

        if (petHint) {
            if (petValue >= 100) {
                petHint.textContent = "Maximum happiness! ♡";
            } else if (petValue >= 70) {
                petHint.textContent = "The cat is really happy!";
            } else if (petValue >= 30) {
                petHint.textContent = "Keep petting ♡";
            } else {
                petHint.textContent = "Pet the cat to make it happy!";
            }
        }
    }

    if (petBigCat) {
        petBigCat.addEventListener("click", () => {
            petValue += 8;
            updatePetGame();

            petBigCat.animate(
                [
                    { transform: "scale(1)" },
                    { transform: "scale(1.06)" },
                    { transform: "scale(1)" }
                ],
                {
                    duration: 260,
                    easing: "ease-out"
                }
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

    // =========================================================
    // MUSIC PLAYER
    // =========================================================

    const audio = $("#player");

    const playerCover = $("#playerCover");
    const playerVisualizer = $("#playerVisualizer");
    const vizBars = $("#vizBars");

    const playerTrack = $("#playerTrack");
    const playerArtist = $("#playerArtist");

    const playerTimeCurrent = $("#playerTimeCurrent");
    const playerTimeTotal = $("#playerTimeTotal");

    const playerSeek = $("#playerSeek");

    const playerPrev = $("#playerPrev");
    const playerPlay = $("#playerPlay");
    const playerNext = $("#playerNext");

    const playerSpotify = $("#playerSpotify");
    const playerVolume = $("#playerVolume");

    const playlist = $("#playlist");

    // ---------------------------------------------------------
    // IMPORTANT:
    // There are NO UI sounds.
    // The audio element below is the ONLY sound source.
    // ---------------------------------------------------------

    let tracks = [];
    let currentTrackIndex = 0;

    // Start at 25%.
    let savedVolume = localStorage.getItem("little-world-volume");

    if (savedVolume !== null) {
        savedVolume = Number(savedVolume);

        if (!Number.isFinite(savedVolume)) {
            savedVolume = 0.25;
        }
    } else {
        savedVolume = 0.25;
    }

    savedVolume = Math.max(0, Math.min(1, savedVolume));

    if (audio) {
        audio.volume = savedVolume;
        audio.muted = false;
    }

    if (playerVolume) {
        playerVolume.value = String(Math.round(savedVolume * 100));
    }

    // ---------------------------------------------------------
    // Fallback tracks
    // These are used if /api/music is unavailable.
    // ---------------------------------------------------------

    const fallbackTracks = [
        {
            title: "Charisma",
            artist: "Jann",
            file: "/music/Jann%20-%20Charisma.mp3"
        },
        {
            title: "Emperor's New Clothes",
            artist: "Jann",
            file: "/music/Jann%20-%20Emperor%27s%20New%20Clothes.mp3"
        },
        {
            title: "Gladiator",
            artist: "Jann",
            file: "/music/Jann%20-%20Gladiator.mp3"
        },
        {
            title: "Lookatme",
            artist: "Jann",
            file: "/music/Jann%20-%20Lookatme.mp3"
        },
        {
            title: "Need A Break",
            artist: "Jann",
            file: "/music/Jann%20-%20Need%20A%20Break.mp3"
        },
        {
            title: "Promise",
            artist: "Jann",
            file: "/music/Jann%20-%20Promise.mp3"
        },
        {
            title: "Smile",
            artist: "Jann",
            file: "/music/Jann%20-%20Smile.mp3"
        },
        {
            title: "Kisskiss",
            artist: "Jann",
            file: "/music/Jann%20Kisskiss.mp3"
        }
    ];

    function normalizeTrack(track) {
        if (!track) return null;

        const title = safeText(
            track.title || track.name,
            "Unknown track"
        );

        const artist = safeText(
            track.artist,
            "Jann"
        );

        let file = safeText(
            track.file || track.url || track.src,
            ""
        );

        if (!file) return null;

        file = file.replace(/\\/g, "/");

        if (!file.startsWith("/") && !file.startsWith("http")) {
            file = `/${file}`;
        }

        return {
            title,
            artist,
            file,
            cover: track.cover || track.image || "",
            spotify: track.spotify || ""
        };
    }

    async function loadMusic() {
        if (!audio) return;

        let apiTracks = null;

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
            console.warn("Music API unavailable, using local tracks.");
        }

        if (apiTracks && apiTracks.length > 0) {
            tracks = apiTracks
                .map(normalizeTrack)
                .filter(Boolean);
        }

        if (!tracks.length) {
            tracks = fallbackTracks
                .map(normalizeTrack)
                .filter(Boolean);
        }

        if (!tracks.length) {
            console.warn("No music tracks found.");
            return;
        }

        renderPlaylist();
        loadTrack(0, false);
    }

    function renderPlaylist() {
        if (!playlist) return;

        playlist.innerHTML = "";

        tracks.forEach((track, index) => {
            const item = document.createElement("div");
            item.className = "music-item";

            if (index === currentTrackIndex) {
                item.classList.add("is-active");
            }

            item.innerHTML = `
                <button class="music-item__button" type="button">
                    <span class="music-item__number">
                        ${String(index + 1).padStart(2, "0")}
                    </span>

                    <span class="music-item__info">
                        <span class="music-item__title">
                            ${track.title}
                        </span>

                        <span class="music-item__artist">
                            ${track.artist}
                        </span>
                    </span>

                    <span class="music-item__icon">
                        ♡
                    </span>
                </button>
            `;

            const button = $(".music-item__button", item);

            if (button) {
                button.addEventListener("click", () => {
                    loadTrack(index, true);
                });
            }

            playlist.appendChild(item);
        });
    }

    function updatePlaylistActive() {
        if (!playlist) return;

        $$(".music-item", playlist).forEach((item, index) => {
            item.classList.toggle(
                "is-active",
                index === currentTrackIndex
            );
        });
    }

    function getTrackUrl(file) {
        try {
            return new URL(file, window.location.origin).href;
        } catch {
            return file;
        }
    }

    function loadTrack(index, autoplay = false) {
        if (!audio || !tracks.length) return;

        currentTrackIndex =
            (index + tracks.length) % tracks.length;

        const track = tracks[currentTrackIndex];

        audio.pause();

        audio.src = getTrackUrl(track.file);
        audio.load();

        if (playerTrack) {
            playerTrack.textContent = track.title;
        }

        if (playerArtist) {
            playerArtist.textContent = track.artist;
        }

        if (playerTimeCurrent) {
            playerTimeCurrent.textContent = "0:00";
        }

        if (playerTimeTotal) {
            playerTimeTotal.textContent = "0:00";
        }

        if (playerSeek) {
            playerSeek.value = "0";
        }

        if (playerCover && track.cover) {
            playerCover.style.backgroundImage =
                `url("${track.cover}")`;
        }

        if (playerSpotify) {
            if (track.spotify) {
                playerSpotify.href = track.spotify;
                playerSpotify.style.display = "";
            } else {
                playerSpotify.style.display = "none";
            }
        }

        updatePlaylistActive();

        if (autoplay) {
            playMusic();
        }
    }

    async function playMusic() {
        if (!audio || !audio.src) return;

        try {
            await audio.play();

            if (playerPlay) {
                playerPlay.textContent = "Ⅱ";
                playerPlay.setAttribute("aria-label", "Pause");
            }

            if (playerVisualizer) {
                playerVisualizer.classList.add("is-playing");
            }

            if (vizBars) {
                vizBars.classList.add("is-playing");
            }

            if (playerCover) {
                playerCover.classList.add("is-playing");
            }
        } catch (error) {
            console.warn("Could not play music:", error);
        }
    }

    function pauseMusic() {
        if (!audio) return;

        audio.pause();

        if (playerPlay) {
            playerPlay.textContent = "▶";
            playerPlay.setAttribute("aria-label", "Play");
        }

        if (playerVisualizer) {
            playerVisualizer.classList.remove("is-playing");
        }

        if (vizBars) {
            vizBars.classList.remove("is-playing");
        }

        if (playerCover) {
            playerCover.classList.remove("is-playing");
        }
    }

    function toggleMusic() {
        if (!audio) return;

        if (audio.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    }

    function nextTrack() {
        if (!tracks.length) return;

        loadTrack(currentTrackIndex + 1, true);
    }

    function previousTrack() {
        if (!tracks.length) return;

        // If the current song is already more than 3 seconds in,
        // pressing previous restarts it.
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        loadTrack(currentTrackIndex - 1, true);
    }

    // ---------------------------------------------------------
    // PLAYER BUTTONS
    // ---------------------------------------------------------

    if (playerPlay) {
        playerPlay.addEventListener("click", toggleMusic);
    }

    if (playerNext) {
        playerNext.addEventListener("click", nextTrack);
    }

    if (playerPrev) {
        playerPrev.addEventListener("click", previousTrack);
    }

    // ---------------------------------------------------------
    // PROGRESS
    // ---------------------------------------------------------

    if (audio) {
        audio.addEventListener("loadedmetadata", () => {
            if (playerTimeTotal) {
                playerTimeTotal.textContent =
                    formatTime(audio.duration);
            }

            if (playerSeek) {
                playerSeek.max = String(
                    Number.isFinite(audio.duration)
                        ? audio.duration
                        : 0
                );
            }
        });

        audio.addEventListener("timeupdate", () => {
            if (playerTimeCurrent) {
                playerTimeCurrent.textContent =
                    formatTime(audio.currentTime);
            }

            if (playerSeek && !playerSeek.matches(":active")) {
                playerSeek.value = String(audio.currentTime);
            }
        });

        audio.addEventListener("play", () => {
            if (playerPlay) {
                playerPlay.textContent = "Ⅱ";
            }

            if (vizBars) {
                vizBars.classList.add("is-playing");
            }

            if (playerCover) {
                playerCover.classList.add("is-playing");
            }
        });

        audio.addEventListener("pause", () => {
            if (playerPlay) {
                playerPlay.textContent = "▶";
            }

            if (vizBars) {
                vizBars.classList.remove("is-playing");
            }

            if (playerCover) {
                playerCover.classList.remove("is-playing");
            }
        });

        audio.addEventListener("ended", () => {
            nextTrack();
        });

        audio.addEventListener("error", () => {
            console.warn(
                "Music file could not be loaded:",
                audio.currentSrc
            );
        });
    }

    if (playerSeek && audio) {
        playerSeek.addEventListener("input", () => {
            const value = Number(playerSeek.value);

            if (Number.isFinite(value)) {
                audio.currentTime = value;
            }
        });
    }

    // ---------------------------------------------------------
    // VOLUME
    // ---------------------------------------------------------

    if (playerVolume && audio) {
        playerVolume.addEventListener("input", () => {
            let value = Number(playerVolume.value);

            if (!Number.isFinite(value)) {
                value = 25;
            }

            value = Math.max(0, Math.min(100, value));

            audio.volume = value / 100;
            audio.muted = false;

            localStorage.setItem(
                "little-world-volume",
                String(audio.volume)
            );
        });
    }

    // ---------------------------------------------------------
    // START MUSIC SYSTEM
    // ---------------------------------------------------------

    loadMusic();

    // =========================================================
    // REMOVE ANY POSSIBLE EXTRA AUDIO ELEMENTS
    // =========================================================
    // The website should only have the main music player.
    // We do NOT create sounds for buttons, cats or interactions.

    $$("audio").forEach(element => {
        if (element !== audio) {
            element.pause();
            element.remove();
        }
    });

    // =========================================================
    // SMALL SCROLL REVEAL
    // =========================================================

    const revealElements = $$(".section, .cat-card, .game-panel");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                    }
                });
            },
            {
                threshold: 0.08
            }
        );

        revealElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });
    }

    console.log("♡ little world loaded");
    console.log("Music tracks:", tracks.length);
    console.log("Initial volume:", Math.round(savedVolume * 100) + "%");
});
```
