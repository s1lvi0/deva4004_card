
function isLightBackgroundColor() {
  const backgroundColor = getComputedStyle(document.getElementsByTagName('html')[0]).getPropertyValue('--card-background-color');
  const [r, g, b] = backgroundColor.match(/\w\w/g).map(x => parseInt(x, 16));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

class Deva4004Card extends HTMLElement {
  set hass(hass) {
    const instance = this.config.instance;
    const device = this.config.device;
    const entityPrefix = instance ? `${instance}_${device}` : device;
    const imgUrlLight = this.config.imageEntity ? `/local/fm_logos/light/${this.config.imageEntity}` : "/local/fm_logos/light/radio-default.png";
    const imgUrlDark = this.config.imageEntity ? `/local/fm_logos/dark/${this.config.imageEntity}` : "/local/fm_logos/dark/radio-default.png";

    const activeEntity = `sensor.${entityPrefix}_active`;
    const frequencyEntity = `sensor.${entityPrefix}_frequency`;
    const rdsPiEntity = `sensor.${entityPrefix}_rds_pi`;
    const rdsPsEntity = `sensor.${entityPrefix}_rds_ps`;
    const rdsRtEntity = `sensor.${entityPrefix}_rds_rt`;
    const chEntity = `sensor.${entityPrefix}_channel`;

    const rfLevelEntity = `sensor.${entityPrefix}_rf_level`;
    const mpxLevelEntity = `sensor.${entityPrefix}_mpx_level`;
    const pilotLevelEntity = `sensor.${entityPrefix}_pilot_level`;
    const rdsLevelEntity = `sensor.${entityPrefix}_rds_level`;
    const leftLevelEntity = `sensor.${entityPrefix}_left_level`;
    const rightLevelEntity = `sensor.${entityPrefix}_right_level`;

    const rfLevelAlarm = `sensor.${entityPrefix}_rf_alarm`;
    const mpxLevelAlarm = `sensor.${entityPrefix}_mpx_alarm`;
    const rdsLevelAlarm = `sensor.${entityPrefix}_rds_alarm`;

    // Fallback to old entity naming pattern if new pattern doesn't exist
    const fallbackPrefix = `${device}_${device}`;

     if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <style>
            .clickable {
              cursor: pointer;
            }
            .alarm-triggered {
              border: 2px solid red;
            }
            .card-content {
              display: flex;
              justify-content: center;
              align-items: center;
              // margin-top: 18px;
              padding-bottom: 8px;
            }
            .top-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
            }
            .image-container {
              margin-left: 16px;
              margin-right: 16px;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 60px;
              width: 60px;
            }
            .info-container {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            }
            .frequency-entity {
              font-size: 14px;
              font-weight: bold;
            }
            .rds-pi {
              font-size: 14px;
            }
            .rds-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 55%;
            }
            .rds-pi-info {
              margin: 0 5px;
              font-size: 12px;
              line-height: 1;
              color: grey;
            }
            .text-info {
              margin: 0 10px;
              font-size: 10px;
              line-height: 1;
              color: grey;
            }
            .rds-ps-entity {
              margin: 0 16px;
              font-size: 16px;
              min-height: 21px;
            }
            .rds-rt-entity {
              margin: 0 5px;
              font-size: 14px;
              min-height: 21px;
            }
            .rds-pi-entity {
              margin: 0 5px;
              font-size: 14px;
            }
            .entity-row {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              align-items: center;
              margin-top: 5px;
            }
            .entity-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              width: 16%;
              margin-bottom: 10px;
            }
            .entity-value {
              margin-top: 2px;
              font-size: 13px;
              font-weight: bold;
            }
            .alarm-row {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              align-items: center;
              margin-top: 0px;
            }
            .alarm-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              width: 33%;
              margin-bottom: 16px;
            }
            .alarm-name {
              margin-top: 2px;
              font-size: 13px;
            }
            .alarm-icon {
              margin-top: 0px;
              font-size: 13px;
            }
            .alarm-icon-ok {
              color: green;
            }
            .alarm-icon-disabled {
              color: grey;
            }
            .alarm-icon-alarm {
              color: red;
            }
            .location-info {
              text-align: left; 
              padding: 5px 0 0 10px; 
              min-height: 21px;
              font-size: 10px; 
              color: grey;
            }
            .location-text {
              font-size: 12px; 
              font-weight: bold;
              color: black;
            }
          </style>
          
          ${this.config.location ? `<div class="location-info">Location: <span class="location-text">${this.config.location}</span></div>` : `<div class="location-info"></div>`}

          <div class="card-content">
            <div class="top-container">
              <div class="image-container">
                <img src="${imgUrlLight}" width="60">
              </div>
              <div class="rds-container">
                <div class="text-info">PS:</div>
                <div class="rds-ps-entity clickable"></div>
                <div class="text-info">Radio Text:</div>
                <div class="rds-rt-entity clickable"></div>
              </div>
              <div class="info-container">
                <div class="frequency-entity clickable" id="frequency_entity"></div>
                <div class="clickable" id="active_entity"></div>
                <div class="clickable"><inline class="rds-pi-info">PI:</inline><inline id="rds_pi_entity"></inline></div>
                <div class="clickable"><inline class="rds-pi-info">CH:</inline><inline id="ch_entity"></inline></div>
              </div>
            </div>
            
          </div>
          <div class="entity-row">
          <div class="entity-container">
            <div class="text-info">RF</div>
            <div class="entity-value clickable" id="rf_level_entity" ></div>
          </div>
          <div class="entity-container">
            <div class="text-info">MPX</div>
            <div class="entity-value clickable" id="mpx_level_entity"></div>
          </div>
          <div class="entity-container">
            <div class="text-info">Pilot</div>
            <div class="entity-value clickable" id="pilot_level_entity"></div>
          </div>
          <div class="entity-container">
            <div class="text-info">RDS</div>
            <div class="entity-value clickable" id="rds_level_entity"></div>
          </div>
          <div class="entity-container">
            <div class="text-info">Left</div>
            <div class="entity-value clickable" id="left_level_entity"></div>
          </div>
          <div class="entity-container">
            <div class="text-info">Right</div>
            <div class="entity-value clickable" id="right_level_entity"></div>
          </div>
        </div>

        <div class="alarm-row">
        <div class="alarm-container">
          <ha-icon class="alarm-icon clickable" icon="mdi:alert-outline" id="rf_level_alarm"></ha-icon>
          <div class="alarm-name">RF Alarm</div>
        </div>
        <div class="alarm-container">
        <ha-icon class="alarm-icon clickable" icon="mdi:alert-outline" id="mpx_level_alarm"></ha-icon>
          <div class="alarm-name">MPX Alarm</div>
        </div>
        <div class="alarm-container">
          <ha-icon class="alarm-icon clickable" icon="mdi:alert-outline" id="rds_level_alarm"></ha-icon>
          <div class="alarm-name">RDS Alarm</div>
        </div>
      </div>
        </ha-card>
      `;
      this.content = this.querySelector(".card-content");

      this.querySelector(".rds-ps-entity").addEventListener('click', () => this.fireEvent(rdsPsEntity));
      this.querySelector(".rds-rt-entity").addEventListener('click', () => this.fireEvent(rdsRtEntity));
      this.querySelector("#rds_pi_entity").addEventListener('click', () => this.fireEvent(rdsPiEntity));
      this.querySelector("#frequency_entity").addEventListener('click', () => this.fireEvent(frequencyEntity));
      this.querySelector("#active_entity").addEventListener('click', () => this.fireEvent(activeEntity));
      this.querySelector("#ch_entity").addEventListener('click', () => this.fireEvent(chEntity));

      this.querySelector("#rf_level_entity").addEventListener('click', () => this.fireEvent(rfLevelEntity));
      this.querySelector("#mpx_level_entity").addEventListener('click', () => this.fireEvent(mpxLevelEntity));
      this.querySelector("#pilot_level_entity").addEventListener('click', () => this.fireEvent(pilotLevelEntity));
      this.querySelector("#rds_level_entity").addEventListener('click', () => this.fireEvent(rdsLevelEntity));
      this.querySelector("#left_level_entity").addEventListener('click', () => this.fireEvent(leftLevelEntity));
      this.querySelector("#right_level_entity").addEventListener('click', () => this.fireEvent(rightLevelEntity));
      
      this.querySelector("#rf_level_alarm").addEventListener('click', () => this.fireEvent(rfLevelAlarm));
      this.querySelector("#mpx_level_alarm").addEventListener('click', () => this.fireEvent(mpxLevelAlarm));
      this.querySelector("#rds_level_alarm").addEventListener('click', () => this.fireEvent(rdsLevelAlarm));

      if (this.config.coordinates) {
        let locationElement = this.querySelector(".location-info");
        locationElement.classList.add("clickable");
        locationElement.addEventListener('click', () => {
          console.log(this.config.coordinates);
            window.open(`https://www.google.com/maps/@${this.config.coordinates},18z/?t=k&q=${this.config.coordinates}`, '_blank');
        });
    }
  
    }

    // Fallback to old entity names if new ones don't exist
    const getEntity = (newName, oldSuffix) => {
      const oldName = `sensor.${fallbackPrefix}_${oldSuffix}`;
      return hass.states[newName] || hass.states[oldName];
    };

    const rdsPsState = getEntity(rdsPsEntity, 'rds_ps');
    const rdsRtState = getEntity(rdsRtEntity, 'rds_rt');
    const rdsPiState = getEntity(rdsPiEntity, 'rds_pi');
    const frequencyState = hass.states[frequencyEntity];
    const activeState = hass.states[activeEntity];
    const chState = hass.states[chEntity];
    const rfLevelState = getEntity(rfLevelEntity, 'rf_level');
    const mpxLevelState = getEntity(mpxLevelEntity, 'mpx_level');
    const pilotLevelState = getEntity(pilotLevelEntity, 'pilot_level');
    const rdsLevelState = getEntity(rdsLevelEntity, 'rds_level');
    const leftLevelState = getEntity(leftLevelEntity, 'left_level');
    const rightLevelState = getEntity(rightLevelEntity, 'right_level');
    const rfAlarmState = getEntity(rfLevelAlarm, 'rf_alarm');
    const mpxAlarmState = getEntity(mpxLevelAlarm, 'mpx_alarm');
    const rdsAlarmState = getEntity(rdsLevelAlarm, 'rds_alarm');

    // Check if all required entities exist
    if (!rdsPsState || !rdsRtState || !rdsPiState || !frequencyState || !activeState || !chState ||
        !rfLevelState || !mpxLevelState || !pilotLevelState || !rdsLevelState ||
        !leftLevelState || !rightLevelState || !rfAlarmState || !mpxAlarmState || !rdsAlarmState) {
      return; // Exit early if entities don't exist yet
    }

    this.querySelector(".rds-ps-entity").textContent = rdsPsState.state;
    this.querySelector(".rds-rt-entity").textContent = rdsRtState.state.toString().substring(0, 60);
    this.querySelector("#rds_pi_entity").textContent = rdsPiState.state;
    this.querySelector("#frequency_entity").textContent = `${frequencyState.state} MHz`;
    this.querySelector("#active_entity").textContent = activeState.state;
    this.querySelector("#ch_entity").textContent = chState.state;

    this.querySelector("#rf_level_entity").textContent = `${rfLevelState.state} dBμV`;
    this.querySelector("#mpx_level_entity").textContent = `${mpxLevelState.state} kHz`;
    this.querySelector("#pilot_level_entity").textContent = `${pilotLevelState.state} kHz`;
    this.querySelector("#rds_level_entity").textContent = `${rdsLevelState.state} kHz`;
    this.querySelector("#left_level_entity").textContent = `${leftLevelState.state} dB`;
    this.querySelector("#right_level_entity").textContent = `${rightLevelState.state} dB`;

    set_alarm_icon(rfAlarmState.state, this.querySelector("#rf_level_alarm"));
    set_alarm_icon(mpxAlarmState.state, this.querySelector("#mpx_level_alarm"));
    set_alarm_icon(rdsAlarmState.state, this.querySelector("#rds_level_alarm"));
  
    const imageElement = this.querySelector(".image-container img");

    if (isLightBackgroundColor()) {
      imageElement.src = imgUrlDark;
    } else {
      imageElement.src = imgUrlLight;
    }

    let anyAlarmTriggered = rfAlarmState.state === "Alarm LOW" || rfAlarmState.state === "Alarm HIGH" ||
                           mpxAlarmState.state === "Alarm LOW" || mpxAlarmState.state === "Alarm HIGH" ||
                           rdsAlarmState.state === "Alarm LOW" || rdsAlarmState.state === "Alarm HIGH";
  
    let cardElement = this.querySelector("ha-card");
    cardElement.classList.remove("alarm-triggered");
    if (anyAlarmTriggered) {
      cardElement.classList.add("alarm-triggered");
    }
  }

  fireEvent(entity) {
    const event = new Event('hass-more-info', {
      bubbles: true,
      composed: true
    });
    event.detail = { entityId: entity };
    this.dispatchEvent(event);
  }

  setConfig(config) {
    if (!config.device) {
      throw new Error("You need to define a device");
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }
}

customElements.define("deva-4004-card", Deva4004Card);


function set_alarm_icon(entity, element) {
  element.classList.remove("alarm-icon-ok", "alarm-icon-disabled", "alarm-icon-alarm");
  element.removeAttribute("title");
  
  if (entity === "OK") {
    element.classList.add("alarm-icon-ok");
  } else if (entity === "Disabled") {
    element.classList.add("alarm-icon-disabled");
    element.setAttribute("title", "Alarm " + entity);
  } else if (entity === "Alarm LOW" || entity === "Alarm HIGH") {
    element.classList.add("alarm-icon-alarm");
    element.setAttribute("title", entity);
  }
}
