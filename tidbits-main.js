const MODULE_ID = "dc20-tidbits";
const BG_PATH = "systems/dc20rpg/images/art/dc20-background.webp";
let dc20TidbitsInterval = null; // interval handle

function getTips() {
	// Tips from lang/en.js
	const tips = Array.isArray(globalThis.DC20_TIDBITS_TIPS_EN) ? globalThis.DC20_TIDBITS_TIPS_EN : [];
	return tips.length ? tips : ["Welcome to DC20!"];
}

function getLabel() {
	return (globalThis.DC20_TIDBITS_I18N && globalThis.DC20_TIDBITS_I18N["DC20TIDBITS.DidYouKnow"]) || "Did you know?";
}

async function showTidbitsOverlay() {
	try {
		const tips = getTips();
		const tip = tips[Math.floor(Math.random() * tips.length)];
		const html = await renderTemplate(`modules/${MODULE_ID}/templates/tidbits-form.html`, {
			background: BG_PATH,
			label: getLabel(),
			tip
		});

		// Remove any existing overlay first
		document.getElementById("dc20-tidbits-overlay")?.remove();

		const wrapper = document.createElement("div");
		wrapper.innerHTML = html.trim();
		const el = wrapper.firstElementChild;
		document.body.appendChild(el);

		// Start rotating tips every 5 seconds
		const bodyEl = el.querySelector(".dc20-tidbits-body");
		let currentIndex = Math.max(0, tips.indexOf(tip));
		clearInterval(dc20TidbitsInterval);
		dc20TidbitsInterval = setInterval(() => {
			if (!document.body.contains(el)) return; // overlay removed
			let nextIndex = currentIndex;
			if (tips.length > 1) {
				while (nextIndex === currentIndex) {
					nextIndex = Math.floor(Math.random() * tips.length);
				}
			}
			currentIndex = nextIndex;
			bodyEl.textContent = tips[currentIndex];
		}, 5000);
	} catch (err) {
		console.error(`${MODULE_ID} | Failed to render overlay`, err);
	}
}

function hideTidbitsOverlay() {
	const el = document.getElementById("dc20-tidbits-overlay");
	if (!el) return;
	el.classList.add("hide");
	// stop rotating tips
	if (dc20TidbitsInterval) {
		clearInterval(dc20TidbitsInterval);
		dc20TidbitsInterval = null;
	}
	el.addEventListener("transitionend", () => el.remove(), { once: true });
	setTimeout(() => el?.remove(), 800); // Fallback
}

Hooks.on("canvasInit", () => {
	showTidbitsOverlay();
});

Hooks.on("canvasReady", () => {
	hideTidbitsOverlay();
});
