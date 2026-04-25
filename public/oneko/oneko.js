// oneko.js (cinematic intro version)

window.startOneko = function () {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  if (isReducedMotion) return;

  if (document.getElementById("oneko")) return;

  const nekoEl = document.createElement("div");

  let nekoPosX = window.innerWidth / 2;
  let nekoPosY = window.innerHeight + 100; // 👇 start OFF SCREEN (bottom)

  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  let mode = "intro"; // 👈 intro → message → active

  const nekoSpeed = 10;
  const introSpeed = 18;

  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function init() {
    nekoEl.id = "oneko";
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX}px`;
    nekoEl.style.top = `${nekoPosY}px`;
    nekoEl.style.zIndex = 2147483647;
    nekoEl.style.backgroundImage = "url(/oneko/oneko.gif)";

    document.body.appendChild(nekoEl);

    document.addEventListener("mousemove", (e) => {
      mousePosX = e.clientX;
      mousePosY = e.clientY;
    });

    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    if (!nekoEl.isConnected) return;

    if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;

    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }

    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function showMessage() {
    const bubble = document.createElement("div");

    bubble.innerText =
      "meow… thank you.\nI got really scared from that thing...\nI’m gonna stay close to you.";
    // 🔥 Main bubble styling
    bubble.style.position = "fixed";

    bubble.style.padding = "8px 12px";
    bubble.style.fontSize = "12px";
    bubble.style.background = "#fff";
    bubble.style.border = "2px solid #222";
    bubble.style.borderRadius = "10px";
    bubble.style.color = "#222";
    bubble.style.whiteSpace = "pre-line";
    bubble.style.zIndex = 2147483647;
    bubble.style.lineHeight = "1.4";

    document.body.appendChild(bubble);


    function updatePosition() {
      bubble.style.left = `${nekoPosX + 20}px`;
      bubble.style.top = `${nekoPosY - 50}px`;
    }

    updatePosition();

    const interval = setInterval(updatePosition, 50);

    setTimeout(() => {
      clearInterval(interval);
      bubble.remove();
      mode = "active";
    }, 6000);
  }

  function moveToHero() {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    const diffX = nekoPosX - targetX;
    const diffY = nekoPosY - targetY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < 20) {
      setSprite("idle", 0);
      mode = "message";
      showMessage();
      return;
    }

    let direction = "";
    direction += diffY > 0 ? "N" : "S";
    direction += diffX > 0 ? "W" : "E";

    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * introSpeed;
    nekoPosY -= (diffY / distance) * introSpeed;

    nekoEl.style.left = `${nekoPosX}px`;
    nekoEl.style.top = `${nekoPosY}px`;
  }

  function idle() {
    idleTime += 1;
    setSprite("idle", 0);
  }

  function normalFollow() {
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    let direction = "";
    direction += diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";

    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoEl.style.left = `${nekoPosX}px`;
    nekoEl.style.top = `${nekoPosY}px`;
  }

  function frame() {
    frameCount++;

    if (mode === "intro") {
      moveToHero();
      return;
    }

    if (mode === "message") {
      setSprite("idle", 0);
      return;
    }

    // 👇 NORMAL BEHAVIOR (UNCHANGED)
    normalFollow();
  }

  init();
};
