// <glyph-loop> and <glyph-favicon>: the same loop for any site, Vue, Angular
// or plain HTML. Importing this file registers both.
import { normalizeLoop, onReducedMotionChange, parseDurations, prefersReducedMotion, runLoop, type Loop } from "./core";
import { startFavicon } from "./favicon";

const LOOP_STYLE =
  ":host{display:inline-grid;line-height:1;vertical-align:middle}" +
  "span{grid-area:1/1;text-align:center;visibility:hidden}span.on{visibility:visible}";

function readLoop(el: HTMLElement): Loop {
  return normalizeLoop({
    frames: el.getAttribute("frames") ?? "",
    speed: el.getAttribute("speed") ?? undefined,
    durations: parseDurations(el.getAttribute("durations")),
  });
}

const isPlaying = (el: HTMLElement) => el.getAttribute("playing") !== "false";

// Classes are defined inside a function because `extends HTMLElement` fails
// at module load where there's no DOM (server rendering, Node).
function define() {
  class GlyphLoopElement extends HTMLElement {
    static observedAttributes = ["frames", "speed", "durations", "playing", "label"];
    #root = this.attachShadow({ mode: "open" });
    #spans: HTMLSpanElement[] = [];
    #index = 0;
    #stop = () => {};
    #unwatch = () => {};

    connectedCallback() {
      this.#unwatch = onReducedMotionChange(() => this.#update());
      this.#update();
    }
    disconnectedCallback() {
      this.#stop();
      this.#unwatch();
    }
    attributeChangedCallback() {
      if (this.isConnected) this.#update();
    }

    #update() {
      this.#stop();
      this.#stop = () => {};
      if (!this.hasAttribute("role")) this.setAttribute("role", "status");
      this.setAttribute("aria-label", this.getAttribute("label") || "Loading");
      const loop = readLoop(this);
      const style = document.createElement("style");
      style.textContent = LOOP_STYLE;
      // textContent, never innerHTML: frames are text, whatever they contain.
      this.#spans = loop.frames.map((frame) => {
        const span = document.createElement("span");
        span.setAttribute("aria-hidden", "true");
        span.textContent = frame;
        return span;
      });
      this.#root.replaceChildren(style, ...this.#spans);
      const reduced = prefersReducedMotion();
      this.#show(reduced || this.#index >= this.#spans.length ? 0 : this.#index);
      if (isPlaying(this) && !reduced) this.#stop = runLoop(loop.durations, (i) => this.#show(i), this.#index);
    }

    #show(i: number) {
      this.#spans[this.#index]?.classList.remove("on");
      this.#index = i;
      this.#spans[i]?.classList.add("on");
    }
  }

  class GlyphFaviconElement extends HTMLElement {
    static observedAttributes = ["frames", "speed", "durations", "playing", "font"];
    #stop = () => {};
    #unwatch = () => {};

    connectedCallback() {
      this.hidden = true;
      this.#unwatch = onReducedMotionChange(() => this.#update());
      this.#update();
    }
    disconnectedCallback() {
      this.#stop();
      this.#unwatch();
    }
    attributeChangedCallback() {
      if (this.isConnected) this.#update();
    }

    #update() {
      this.#stop();
      this.#stop = () => {};
      if (!isPlaying(this)) return;
      const loop = readLoop(this);
      const still = { frames: loop.frames.slice(0, 1), durations: loop.durations.slice(0, 1) };
      this.#stop = startFavicon(prefersReducedMotion() ? still : loop, { font: this.getAttribute("font") ?? undefined });
    }
  }

  // Another copy of this file on the page may have registered them already.
  if (!customElements.get("glyph-loop")) customElements.define("glyph-loop", GlyphLoopElement);
  if (!customElements.get("glyph-favicon")) customElements.define("glyph-favicon", GlyphFaviconElement);
}

if (typeof window !== "undefined" && typeof customElements !== "undefined") define();

export {};
