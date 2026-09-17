const wifeName = "My Wife";

const navToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const bgMusic = document.querySelector("#bgMusic");
const cakeMusic = document.querySelector("#cakeMusic");
const musicToggle = document.querySelector(".music-toggle");
const cakeSection = document.querySelector("#cake");
const cakeStage = document.querySelector(".cake-stage");
const cakeButton = document.querySelector("#cakeButton");
const cakePrompt = document.querySelector("#cakePrompt");
const cakeStatus = document.querySelector("#cakeStatus");
const cakeWish = document.querySelector("#cakeWish");
const cakeFireworks = document.querySelector("#cakeFireworks");
const balloonSection = document.querySelector("#balloons");
const balloons = [...document.querySelectorAll(".balloon")];
const scrollCue = document.querySelector("#scrollCue");
const fireworksOverlay = document.querySelector("#fireworksOverlay");
const fireworksField = document.querySelector(".fireworks-field");
const quizCards = [...document.querySelectorAll(".quiz-card")];
const quizProgress = document.querySelector("#quizProgress");
const quizReset = document.querySelector("#quizReset");
const quizReward = document.querySelector("#quizReward");
const quizRewardHearts = document.querySelector(".quiz-reward-hearts");
const slides = [...document.querySelectorAll(".slide")];
const prevSlide = document.querySelector(".prev");
const nextSlide = document.querySelector(".next");
const canvas = document.querySelector("#confettiCanvas");
const ctx = canvas.getContext("2d");

let musicWanted = true;
let currentSlide = 0;
let confettiPieces = [];
let confettiFrame;
let cakeFinished = false;
let cakeWasCut = false;
let cakeMusicStarted = false;
let cakeMusicPending = false;
let cakeMusicCompleted = false;
let cakeSectionActive = false;
let balloonsShown = false;
let balloonsPopped = 0;
let fireworksStarted = false;
let balloonRevealScrollY = 0;
let quizRewardTimeout;

document.addEventListener("DOMContentLoaded", () => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  window.addEventListener("pageshow", () => window.scrollTo(0, 0), { once: true });
  document.querySelector("h1 span").textContent = wifeName;

  setupMenu();
  setupMediaFallbacks();
  setupMusic();
  setupRevealAnimations();
  setupCakeScroll();
  setupCakeCutting();
  setupBalloons();
  setupCarousel();
  setupQuiz();
  createFallingFlowers();
  launchConfetti();
});

function setupMediaFallbacks() {
  document.querySelectorAll(".card-front img, .carousel-image").forEach((image) => {
    const showImageFallback = () => {
      const card = image.closest(".card-front");
      if (card) card.classList.add("has-missing-image");

      const carouselFallback = image.parentElement?.querySelector(".carousel-image-fallback");
      if (carouselFallback) {
        image.hidden = true;
        carouselFallback.hidden = false;
      }
    };

    image.addEventListener("error", showImageFallback);
    if (image.complete && image.naturalWidth === 0) showImageFallback();
  });

}

function setupMenu() {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  navLinks.addEventListener("click", (event) => {
    if (!event.target.matches("a")) return;
    navLinks.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  });
}

function setupMusic() {
  bgMusic.volume = 0.22;
  cakeMusic.volume = 0.68;
  startBackgroundMusic();

  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, () => {
      if (cakeSectionActive && !cakeMusicStarted) {
        startCakeMusic();
      } else if (musicWanted && bgMusic.paused) {
        startBackgroundMusic();
      }
    }, { once: true, passive: true });
  });

  musicToggle.addEventListener("click", () => {
    musicWanted = bgMusic.paused;
    if (musicWanted) {
      if (!cakeMusicStarted) startBackgroundMusic();
    } else {
      bgMusic.pause();
    }
    updateMusicButton();
  });

  updateMusicButton();
}

function startBackgroundMusic() {
  if (!musicWanted || cakeMusicStarted) return;
  if (!bgMusic.paused) {
    bgMusic.muted = false;
    updateMusicButton();
    return;
  }
  bgMusic.muted = true;
  bgMusic.volume = 0.22;
  bgMusic.play().then(() => {
    bgMusic.muted = false;
    updateMusicButton();
  }).catch(updateMusicButton);
}

function startCakeMusic() {
  if (cakeMusicStarted || cakeMusicPending || cakeMusicCompleted) return;
  cakeMusicPending = true;
  bgMusic.pause();
  updateMusicButton();
  cakeMusic.currentTime = 0;
  cakeMusic.loop = true;
  cakeMusic.play().then(() => {
    cakeMusicStarted = true;
    cakeMusicPending = false;
  }).catch(() => {
    cakeMusicPending = false;
    if (musicWanted) startBackgroundMusic();
  });
}

function updateMusicButton() {
  const isPlaying = !bgMusic.paused && musicWanted;
  musicToggle.classList.toggle("is-paused", !isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.querySelector("span").textContent = isPlaying ? "♫" : "♪";
}

function fadeTo(audio, targetVolume, duration = 900, onDone) {
  const startVolume = audio.volume;
  const started = performance.now();
  const step = (now) => {
    const progress = Math.min((now - started) / duration, 1);
    audio.volume = startVolume + (targetVolume - startVolume) * progress;
    if (progress < 1) return requestAnimationFrame(step);
    if (onDone) onDone();
  };
  requestAnimationFrame(step);
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible", "animate__animated", "animate__fadeInUp");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
}

function setupCakeCutting() {
  cakeButton.addEventListener("click", () => {
    if (cakeStage.classList.contains("is-cut")) return;

    document.body.classList.add("is-cake-dark");
    cakeStage.classList.add("is-cut", "is-celebrating");
    cakePrompt.classList.add("is-hidden");
    cakeStatus.textContent = "Wish made. Sending you all the love!";
    cakeWish.hidden = false;
    cakeWish.classList.add("animate__animated", "animate__fadeIn", "animate__bounceIn");
    cakeWasCut = true;
    if (!cakeMusicStarted) startCakeMusic();
    runFireworks(cakeFireworks, 18);
    window.setTimeout(showBalloons, 1700);
  });

  cakeMusic.addEventListener("ended", () => {
    cakeMusicStarted = false;
    cakeMusicPending = false;
    cakeMusicCompleted = true;
  }, { once: true });
}

function showBalloons() {
  if (balloonsShown) return;
  balloonsShown = true;
  cakeStage.classList.remove("is-celebrating");
  document.body.classList.remove("is-cake-dark");
  cakeFinished = true;
  cakeStage.hidden = true;
  cakeSection.classList.add("cake-finished");
  balloonSection.hidden = false;
  requestAnimationFrame(() => {
    balloonRevealScrollY = window.scrollY;
    balloonSection.classList.add("is-visible");
  });
}

function setupBalloons() {
  balloons.forEach((balloon) => {
    balloon.addEventListener("click", () => popBalloon(balloon));
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > balloonRevealScrollY + 80) {
      scrollCue.classList.add("is-hidden");
    }
  }, { passive: true });
}

function popBalloon(balloon) {
  if (balloon.disabled || fireworksStarted) return;
  balloon.disabled = true;
  playPopSound();
  createBalloonConfetti(balloon);
  balloon.classList.add("is-popped");
  balloonsPopped += 1;

  if (balloonsPopped === balloons.length) {
    window.setTimeout(startFinalFireworks, 520);
  }
}

function playPopSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(260, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(90, audioContext.currentTime + 0.12);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.11, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.14);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
  oscillator.addEventListener("ended", () => audioContext.close(), { once: true });
}

function createBalloonConfetti(balloon) {
  const colors = ["#ff4f93", "#ffce45", "#52d6a3", "#8a63d2", "#61c7ff"];
  const rect = balloon.getBoundingClientRect();
  Array.from({ length: 14 }, (_, index) => {
    const particle = document.createElement("span");
    particle.className = "balloon-confetti";
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height * 0.38}px`;
    particle.style.setProperty("--confetti-color", colors[index % colors.length]);
    particle.style.setProperty("--confetti-x", `${Math.round(Math.random() * 150 - 75)}px`);
    particle.style.setProperty("--confetti-y", `${Math.round(Math.random() * -130 - 25)}px`);
    document.body.appendChild(particle);
    window.setTimeout(() => particle.remove(), 720);
  });
}

function startFinalFireworks() {
  if (fireworksStarted) return;
  fireworksStarted = true;
  fireworksOverlay.classList.add("is-active");
  fireworksField.innerHTML = "";
  runFireworks(fireworksField, 30);
  fadeTo(cakeMusic, 0, 1100, () => {
    cakeMusic.pause();
    cakeMusic.currentTime = 0;
    cakeMusicStarted = false;
    if (musicWanted) {
      bgMusic.volume = 0;
      startBackgroundMusic();
      fadeTo(bgMusic, 0.22, 1200);
    }
  });
  window.setTimeout(() => fireworksOverlay.classList.remove("is-active"), 5200);
}

function setupCakeScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (cakeFinished) return;
      cakeSectionActive = entry.isIntersecting;
      document.body.classList.toggle("is-cake-dark", entry.isIntersecting);
      if (entry.isIntersecting) startCakeMusic();
    });
  }, { threshold: 0.55 });

  observer.observe(cakeSection);
}

function runFireworks(container, total) {
  const colors = ["#ff4f93", "#ffce45", "#52d6a3", "#8a63d2", "#61c7ff"];
  let count = 0;
  const timer = setInterval(() => {
    const burst = document.createElement("span");
    burst.className = "burst";
    burst.style.left = `${Math.random() * 82 + 9}%`;
    burst.style.top = `${Math.random() * 70 + 8}%`;
    burst.style.setProperty("--burst-color", colors[count % colors.length]);
    container.appendChild(burst);
    setTimeout(() => burst.remove(), 1000);
    count += 1;
    if (count >= total) clearInterval(timer);
  }, 150);
}

function setupCarousel() {
  const showSlide = (index) => {
    slides[currentSlide].classList.remove("is-active");
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add("is-active");
  };
  prevSlide.addEventListener("click", () => showSlide(currentSlide - 1));
  nextSlide.addEventListener("click", () => showSlide(currentSlide + 1));
}

function setupQuiz() {
  quizCards.forEach((card) => {
    card.querySelectorAll(".quiz-options button").forEach((option) => {
      option.addEventListener("click", () => checkQuizAnswer(card, option));
    });
  });
  quizReset.addEventListener("click", resetQuiz);
}

function resetQuiz() {
  window.clearTimeout(quizRewardTimeout);
  quizCards.forEach((card) => {
    card.classList.remove("is-correct");
    const feedback = card.querySelector(".quiz-feedback");
    feedback.hidden = true;
    feedback.textContent = "";
    feedback.className = "quiz-feedback";
    card.querySelectorAll(".quiz-options button").forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-selected", "is-wrong");
    });
  });
  quizProgress.textContent = `0 of ${quizCards.length} remembered`;
  quizProgress.style.setProperty("--progress", "0%");
  quizReward.classList.remove("is-active");
  quizReward.setAttribute("aria-hidden", "true");
  quizRewardHearts.replaceChildren();
}

function checkQuizAnswer(card, option) {
  if (card.classList.contains("is-correct")) return;

  const feedback = card.querySelector(".quiz-feedback");
  const isCorrect = option.dataset.answer === card.dataset.answer;
  card.querySelectorAll(".quiz-options button").forEach((button) => {
    button.classList.toggle("is-selected", button === option);
    if (isCorrect) button.disabled = true;
  });

  feedback.hidden = false;
  feedback.className = `quiz-feedback ${isCorrect ? "is-correct" : "is-wrong"} animate__animated ${isCorrect ? "animate__bounceIn" : "animate__fadeIn"}`;
  feedback.textContent = isCorrect
    ? "Correct! 💖"
    : "Incorrect! 😉";

  if (!isCorrect) {
    option.classList.add("is-wrong");
    window.setTimeout(() => option.classList.remove("is-wrong"), 500);
    return;
  }

  card.classList.add("is-correct");
  updateQuizProgress();
  if (quizCards.every((quizCard) => quizCard.classList.contains("is-correct"))) {
    window.setTimeout(showQuizReward, 500);
  }
}

function updateQuizProgress() {
  const completed = quizCards.filter((card) => card.classList.contains("is-correct")).length;
  quizProgress.textContent = `${completed} of ${quizCards.length} remembered`;
  quizProgress.style.setProperty("--progress", `${(completed / quizCards.length) * 100}%`);
}

function showQuizReward() {
  quizReward.setAttribute("aria-hidden", "false");
  quizReward.classList.add("is-active");
  quizRewardHearts.replaceChildren();
  Array.from({ length: 18 }, (_, index) => {
    const heart = document.createElement("span");
    heart.textContent = index % 2 ? "💖" : "💕";
    heart.style.setProperty("--heart-left", `${Math.random() * 100}%`);
    heart.style.setProperty("--heart-delay", `${Math.random() * 0.8}s`);
    heart.style.setProperty("--heart-drift", `${Math.round(Math.random() * 120 - 60)}px`);
    quizRewardHearts.appendChild(heart);
  });
  playQuizDing();
  quizRewardTimeout = window.setTimeout(() => {
    quizReward.classList.remove("is-active");
    quizReward.setAttribute("aria-hidden", "true");
  }, 4200);
}

function playQuizDing() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.36);
  oscillator.addEventListener("ended", () => audioContext.close(), { once: true });
}

function createFallingFlowers() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const flowerFall = document.querySelector("#flowerFall");
  const flowers = ["🌸", "🌺"];
  Array.from({ length: 10 }, (_, index) => {
    const flower = document.createElement("span");
    flower.className = "falling-flower";
    flower.textContent = flowers[index % flowers.length];
    flower.style.left = `${index * 10 + Math.random() * 7}%`;
    flower.style.setProperty("--fall-duration", `${13 + Math.random() * 9}s`);
    flower.style.setProperty("--fall-delay", `${-Math.random() * 18}s`);
    flower.style.setProperty("--flower-drift", `${Math.round(Math.random() * 140 - 70)}px`);
    flowerFall.appendChild(flower);
  });
}

function launchConfetti() {
  const resizeCanvas = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };
  const createPieces = () => {
    const colors = ["#ff4f93", "#ffce45", "#52d6a3", "#8a63d2", "#61c7ff"];
    confettiPieces = Array.from({ length: 130 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * -window.innerHeight,
      size: Math.random() * 7 + 4, speed: Math.random() * 2.6 + 1.2,
      angle: Math.random() * Math.PI, spin: Math.random() * 0.18 - 0.09,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += Math.sin(piece.angle) * 1.1;
      piece.angle += piece.spin;
      ctx.save(); ctx.translate(piece.x, piece.y); ctx.rotate(piece.angle);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
      ctx.restore();
    });
    confettiPieces = confettiPieces.filter((piece) => piece.y < window.innerHeight + 24);
    if (confettiPieces.length) confettiFrame = requestAnimationFrame(draw);
  };
  resizeCanvas(); createPieces(); draw();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(confettiFrame); resizeCanvas(); createPieces(); draw();
  });
}
