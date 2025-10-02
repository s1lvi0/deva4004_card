import { LitElement, html, css } from "https://unpkg.com/lit@3.1.0/index.js?module";

class Deva4004Card extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _rtScrolling: { type: Boolean, state: true }
  };

  static styles = css`
    :host {
      --primary-color: var(--primary-text-color);
      --secondary-color: var(--secondary-text-color);
      --alarm-color: var(--error-color, #f44336);
      --ok-color: var(--success-color, #4caf50);
      --disabled-color: var(--disabled-text-color, #9e9e9e);
    }

    ha-card {
      padding: 8px 12px;
      transition: border 0.3s ease;
    }

    ha-card.alarm {
      border: 2px solid var(--alarm-color);
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .logo {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      border-radius: 8px;
      object-fit: contain;
    }

    .main-info {
      flex: 1;
      min-width: 0;
    }

    .station-name {
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 0 2px 0;
    }

    .radio-text {
      font-size: 11px;
      color: var(--secondary-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
      position: relative;
    }

    .radio-text.scrolling {
      mask-image: linear-gradient(90deg, transparent, #000 10px, #000 calc(100% - 10px), transparent);
      text-overflow: clip;
    }

    .radio-text.scrolling .radio-text-inner {
      display: inline-block;
      animation: scroll-text 20s linear infinite;
    }

    .radio-text.scrolling .radio-text-inner::after {
      content: attr(data-text);
      padding-left: 2em;
    }

    .radio-text:not(.scrolling) .radio-text-inner::after {
      display: none;
    }

    @keyframes scroll-text {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .freq-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .frequency {
      font-size: 18px;
      font-weight: 700;
    }

    .meta {
      font-size: 10px;
      color: var(--secondary-color);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px 8px;
      margin: 8px 0 4px;
    }

    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .metric:hover {
      background-color: var(--secondary-background-color);
    }

    .metric-label {
      font-size: 9px;
      color: var(--secondary-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 13px;
      font-weight: 600;
      margin-top: 1px;
    }

    .alarms {
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 1px solid var(--divider-color);
      padding-top: 6px;
      margin-top: 2px;
    }

    .alarm-item {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .alarm-item:hover {
      background-color: var(--secondary-background-color);
    }

    .alarm-label {
      font-size: 10px;
      font-weight: 500;
    }

    ha-icon {
      --mdc-icon-size: 16px;
    }

    ha-icon.ok { color: var(--ok-color); }
    ha-icon.disabled { color: var(--disabled-color); }
    ha-icon.alarm { color: var(--alarm-color); }

    .location {
      font-size: 9px;
      color: var(--secondary-color);
      margin-bottom: 4px;
      cursor: pointer;
    }

    .location:hover {
      text-decoration: underline;
    }

    .clickable {
      cursor: pointer;
    }
  `;

  setConfig(config) {
    if (!config.device) {
      throw new Error("You need to define a device");
    }
    this.config = config;
  }

  getCardSize() {
    return 2;
  }

  _handleClick(entityId) {
    const event = new Event('hass-more-info', {
      bubbles: true,
      composed: true
    });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  _openMap() {
    if (this.config.coordinates) {
      window.open(`https://www.google.com/maps/@${this.config.coordinates},18z/?t=k&q=${this.config.coordinates}`, '_blank');
    }
  }

  _getEntity(suffix) {
    const instance = this.config.instance;
    const device = this.config.device;
    const prefix = instance ? `${instance}_${device}` : device;
    const entityId = `sensor.${prefix}_${suffix}`;
    return this.hass?.states[entityId];
  }

  _getAlarmClass(state) {
    if (!state) return 'disabled';
    if (state === 'OK') return 'ok';
    if (state === 'Disabled') return 'disabled';
    if (state.includes('Alarm')) return 'alarm';
    return 'disabled';
  }

  _hasAlarm() {
    const rfAlarm = this._getEntity('rf_alarm')?.state;
    const mpxAlarm = this._getEntity('mpx_alarm')?.state;
    const rdsAlarm = this._getEntity('rds_alarm')?.state;

    return [rfAlarm, mpxAlarm, rdsAlarm].some(state =>
      state === 'Alarm LOW' || state === 'Alarm HIGH'
    );
  }

  _getImageUrl() {
    // Use Home Assistant's theme detection via hass object or primary-background-color
    const isDark = this.hass?.themes?.darkMode ??
      (getComputedStyle(this).getPropertyValue('--primary-background-color').trim().startsWith('#') ?
        parseInt(getComputedStyle(this).getPropertyValue('--primary-background-color').trim().slice(1, 3), 16) < 128 :
        false);

    const themeFolder = isDark ? 'dark-theme' : 'light-theme';
    const img = this.config.imageEntity || 'radio-default.png';
    return `/local/fm_logos/${themeFolder}/${img}`;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Check if RT text actually overflows after render
    if (changedProperties.has('hass')) {
      const rtContainer = this.shadowRoot?.querySelector('.radio-text');
      const rtInner = this.shadowRoot?.querySelector('.radio-text-inner');

      if (rtContainer && rtInner) {
        // Remove the duplicate text temporarily to measure real width
        const text = rtInner.textContent;
        rtInner.removeAttribute('data-text');

        const containerWidth = rtContainer.offsetWidth;
        const textWidth = rtInner.scrollWidth;

        // Add back the data attribute
        rtInner.setAttribute('data-text', text);

        // Only scroll if text is actually wider than container
        this._rtScrolling = textWidth > containerWidth;
      }
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const frequency = this._getEntity('frequency');
    const active = this._getEntity('active');
    const channel = this._getEntity('channel');
    const rdsPs = this._getEntity('rds_ps');
    const rdsRt = this._getEntity('rds_rt');
    const rdsPi = this._getEntity('rds_pi');
    const rfLevel = this._getEntity('rf_level');
    const mpxLevel = this._getEntity('mpx_level');
    const pilotLevel = this._getEntity('pilot_level');
    const rdsLevel = this._getEntity('rds_level');
    const leftLevel = this._getEntity('left_level');
    const rightLevel = this._getEntity('right_level');
    const rfAlarm = this._getEntity('rf_alarm');
    const mpxAlarm = this._getEntity('mpx_alarm');
    const rdsAlarm = this._getEntity('rds_alarm');

    if (!frequency) return html`<ha-card>Loading...</ha-card>`;

    return html`
      <ha-card class="${this._hasAlarm() ? 'alarm' : ''}">
        ${this.config.location ? html`
          <div class="location clickable" @click="${this._openMap}">
            ${this.config.location}
          </div>
        ` : ''}

        <div class="header">
          <img class="logo" src="${this._getImageUrl()}" alt="Station Logo">

          <div class="main-info">
            <div class="station-name clickable" @click="${() => this._handleClick(rdsPs?.entity_id)}">
              ${rdsPs?.state || 'Unknown'}
            </div>
            <div class="radio-text ${this._rtScrolling ? 'scrolling' : ''} clickable" @click="${() => this._handleClick(rdsRt?.entity_id)}">
              <span class="radio-text-inner" data-text="${rdsRt?.state || ''}">
                ${rdsRt?.state || ''}
              </span>
            </div>
          </div>

          <div class="freq-info">
            <div class="frequency clickable" @click="${() => this._handleClick(frequency?.entity_id)}">
              ${frequency?.state} <span style="font-size: 12px;">MHz</span>
            </div>
            <div class="meta">
              <span class="clickable" @click="${() => this._handleClick(active?.entity_id)}">${active?.state}</span> •
              <span class="clickable" @click="${() => this._handleClick(channel?.entity_id)}">CH${channel?.state}</span> •
              <span class="clickable" @click="${() => this._handleClick(rdsPi?.entity_id)}">${rdsPi?.state}</span>
            </div>
          </div>
        </div>

        <div class="metrics">
          <div class="metric clickable" @click="${() => this._handleClick(rfLevel?.entity_id)}">
            <div class="metric-label">RF</div>
            <div class="metric-value">${rfLevel?.state}</div>
          </div>
          <div class="metric clickable" @click="${() => this._handleClick(mpxLevel?.entity_id)}">
            <div class="metric-label">MPX</div>
            <div class="metric-value">${mpxLevel?.state}</div>
          </div>
          <div class="metric clickable" @click="${() => this._handleClick(pilotLevel?.entity_id)}">
            <div class="metric-label">Pilot</div>
            <div class="metric-value">${pilotLevel?.state}</div>
          </div>
          <div class="metric clickable" @click="${() => this._handleClick(rdsLevel?.entity_id)}">
            <div class="metric-label">RDS</div>
            <div class="metric-value">${rdsLevel?.state}</div>
          </div>
          <div class="metric clickable" @click="${() => this._handleClick(leftLevel?.entity_id)}">
            <div class="metric-label">Left</div>
            <div class="metric-value">${leftLevel?.state}</div>
          </div>
          <div class="metric clickable" @click="${() => this._handleClick(rightLevel?.entity_id)}">
            <div class="metric-label">Right</div>
            <div class="metric-value">${rightLevel?.state}</div>
          </div>
        </div>

        <div class="alarms">
          <div class="alarm-item clickable" @click="${() => this._handleClick(rfAlarm?.entity_id)}">
            <ha-icon icon="mdi:antenna" class="${this._getAlarmClass(rfAlarm?.state)}"></ha-icon>
            <span class="alarm-label">RF</span>
          </div>
          <div class="alarm-item clickable" @click="${() => this._handleClick(mpxAlarm?.entity_id)}">
            <ha-icon icon="mdi:waveform" class="${this._getAlarmClass(mpxAlarm?.state)}"></ha-icon>
            <span class="alarm-label">MPX</span>
          </div>
          <div class="alarm-item clickable" @click="${() => this._handleClick(rdsAlarm?.entity_id)}">
            <ha-icon icon="mdi:radio" class="${this._getAlarmClass(rdsAlarm?.state)}"></ha-icon>
            <span class="alarm-label">RDS</span>
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define("deva-4004-card", Deva4004Card);
