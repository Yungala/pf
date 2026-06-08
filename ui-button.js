/* =====================================================================
   <ui-button> — single source of truth for every button on the page.
   Change the look of ALL buttons by editing the tokens in :root (see the
   --uib-* custom properties) or via the Tweaks panel. The component reads
   those tokens, so the design system lives in one place.

   Attributes:
     label="Resume"          text shown in the button
     variant="outline|solid|ghost"   default: outline
     size="sm|md|lg"         default: md
     icon="none|arrow|download"      trailing icon, default: none
     href="#"                renders an <a> instead of a <button>
     block                   full-width
     data-popup-open / id    pass-throughs still work (host keeps them)

   Tokens (set on :root or body, overridable per-theme/tweak):
     --uib-accent      brand color (border + text on outline)        #0422F5
     --uib-on-accent   text color on a filled button                 #ffffff
     --uib-radius      corner radius                                 999px
     --uib-border      border width                                  1.5px
     --uib-weight      font-weight                                   500
     --uib-tracking    letter-spacing                                -0.01em
   ===================================================================== */
(function () {
  const ICONS = {
    none: '',
    arrow: '<svg class="uib-ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    download: '<svg class="uib-ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 19h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  const TPL = document.createElement('template');
  TPL.innerHTML = `
    <style>
      :host {
        display: inline-flex;
        vertical-align: middle;
        --_accent: var(--uib-accent, #0422F5);
        --_on: var(--uib-on-accent, #ffffff);
        --_radius: var(--uib-radius, 999px);
        --_border: var(--uib-border, 1.5px);
        --_weight: var(--uib-weight, 500);
        --_track: var(--uib-tracking, -0.01em);
      }
      :host([block]) { display: flex; }
      :host([block]) .uib { width: 100%; justify-content: center; }

      .uib {
        --pad-y: 14px; --pad-x: 26px; --fs: 15px; --gap: 10px; --ic: 17px;
        font-family: Pretendard, system-ui, sans-serif;
        font-weight: var(--_weight);
        letter-spacing: var(--_track);
        font-size: var(--fs);
        line-height: 1;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: var(--gap);
        padding: var(--pad-y) var(--pad-x);
        border-radius: var(--_radius);
        border: var(--_border) solid var(--_accent);
        background: var(--uib-fill-bg, transparent);
        color: var(--uib-fill-fg, var(--_accent));
        cursor: pointer;
        text-decoration: none;
        box-sizing: border-box;
        -webkit-appearance: none;
        appearance: none;
        transition: background .24s ease, color .24s ease,
                    border-color .24s ease, transform .12s ease, box-shadow .24s ease;
      }
      .uib:hover { background: var(--_accent); color: var(--_on); }
      .uib:active { transform: translateY(1px); }
      .uib:focus-visible { outline: 2px solid var(--_accent); outline-offset: 3px; }

      /* sizes */
      :host([size="sm"]) .uib { --pad-y: 9px;  --pad-x: 18px; --fs: 13px; --gap: 8px;  --ic: 15px; }
      :host([size="lg"]) .uib { --pad-y: 17px; --pad-x: 40px; --fs: 17px; --gap: 12px; --ic: 19px; }

      /* solid: filled by default, lifts on hover */
      :host([variant="solid"]) .uib { background: var(--_accent); color: var(--_on); }
      :host([variant="solid"]) .uib:hover {
        box-shadow: 0 8px 22px -8px var(--_accent);
        transform: translateY(-1px);
      }
      :host([variant="solid"]) .uib:active { transform: translateY(0); }

      /* ghost: no border until hover */
      :host([variant="ghost"]) .uib { border-color: transparent; }
      :host([variant="ghost"]) .uib:hover { background: color-mix(in srgb, var(--_accent) 12%, transparent); color: var(--_accent); }

      .uib-ic { width: var(--ic); height: var(--ic); flex: none; transition: transform .24s ease; }
      :host([icon="arrow"]) .uib:hover .uib-ic { transform: translateX(3px); }
      :host([icon="download"]) .uib:hover .uib-ic { transform: translateY(2px); }

      @media (prefers-reduced-motion: reduce) {
        .uib, .uib-ic { transition: none; }
      }
    </style>
    <span class="uib" part="button"><span class="uib-label"></span></span>
  `;

  class UiButton extends HTMLElement {
    static get observedAttributes() { return ['label', 'icon', 'href']; }

    connectedCallback() {
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' }).appendChild(TPL.content.cloneNode(true));
      }
      this._render();
    }
    attributeChangedCallback() { if (this.shadowRoot) this._render(); }

    _render() {
      const root = this.shadowRoot;
      const href = this.getAttribute('href');
      let el = root.querySelector('.uib');

      // swap between <a> and <span> if href presence changed
      const wantTag = href != null ? 'A' : 'SPAN';
      if (el.tagName !== wantTag) {
        const next = document.createElement(href != null ? 'a' : 'span');
        next.className = 'uib';
        next.setAttribute('part', 'button');
        el.replaceWith(next);
        el = next;
      }
      if (href != null) el.setAttribute('href', href); else el.removeAttribute('href');

      const icon = this.getAttribute('icon') || 'none';
      el.innerHTML = `<span class="uib-label">${this.getAttribute('label') || ''}</span>${ICONS[icon] || ''}`;
    }
  }

  if (!customElements.get('ui-button')) customElements.define('ui-button', UiButton);
})();
