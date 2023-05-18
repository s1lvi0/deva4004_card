
function isLightBackgroundColor() {
  const backgroundColor = getComputedStyle(document.getElementsByTagName('html')[0]).getPropertyValue('--card-background-color');
  const [r, g, b] = backgroundColor.match(/\w\w/g).map(x => parseInt(x, 16));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

class Deva4004Card extends HTMLElement {
  set hass(hass) {
    const device = this.config.device;
    const imgUrlLight = this.config.imageEntity ? `/local/fm_logos/light/${this.config.imageEntity}` : "/local/fm_logos/light/radio-default.png";
    const imgUrlDark = this.config.imageEntity ? `/local/fm_logos/dark/${this.config.imageEntity}` : "/local/fm_logos/light/radio-default.png";

    const activeEntity = `sensor.${device}_active`;
    const frequencyEntity = `sensor.${device}_frequency`;
    const rdsPiEntity = `sensor.${device}_rds_pi`;
    const rdsPsEntity = `sensor.${device}_rds_ps`;
    const rdsRtEntity = `sensor.${device}_rds_rt`;
    const chEntity = `sensor.${device}_channel`;

    const rfLevelEntity = `sensor.${device}_rf_level`;
    const mpxLevelEntity = `sensor.${device}_mpx_level`;
    const pilotLevelEntity = `sensor.${device}_pilot_level`;
    const rdsLevelEntity = `sensor.${device}_rds_level`;
    const leftLevelEntity = `sensor.${device}_left_level`;
    const rightLevelEntity = `sensor.${device}_right_level`;

    const rfLevelAlarm = `sensor.${device}_rf_alarm`;
    const mpxLevelAlarm = `sensor.${device}_mpx_alarm`;
    const rdsLevelAlarm = `sensor.${device}_rds_alarm`;

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
            }
            .rds-rt-entity {
              margin: 0 5px;
              font-size: 14px;
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

      if (this.config.coordinates) {
        let locationElement = this.querySelector(".location-info");
        locationElement.classList.add("clickable");
        locationElement.addEventListener('click', () => {
          console.log(this.config.coordinates);
            window.open(`https://www.google.com/maps/@${this.config.coordinates},18z/?t=k&q=${this.config.coordinates}`, '_blank');
        });
    }
  
    }
    
    this.querySelector(".rds-ps-entity").textContent = hass.states[rdsPsEntity].state;
    this.querySelector(".rds-rt-entity").textContent = hass.states[rdsRtEntity].state.toString().substring(0, 60);
    this.querySelector("#rds_pi_entity").textContent = hass.states[rdsPiEntity].state;
    this.querySelector("#frequency_entity").textContent = `${hass.states[frequencyEntity].state} MHz`;
    this.querySelector("#active_entity").textContent = hass.states[activeEntity].state;
    this.querySelector("#ch_entity").textContent = hass.states[chEntity].state;

    this.querySelector("#rf_level_entity").textContent = `${hass.states[rfLevelEntity].state} dBμV`;
    this.querySelector("#mpx_level_entity").textContent = `${hass.states[mpxLevelEntity].state} kHz`;
    this.querySelector("#pilot_level_entity").textContent = `${hass.states[pilotLevelEntity].state} kHz`;
    this.querySelector("#rds_level_entity").textContent = `${hass.states[rdsLevelEntity].state} kHz`;
    this.querySelector("#left_level_entity").textContent = `${hass.states[leftLevelEntity].state} dB`;
    this.querySelector("#right_level_entity").textContent = `${hass.states[rightLevelEntity].state} dB`;

    set_alarm_icon(hass.states[rfLevelAlarm].state, this.querySelector("#rf_level_alarm"));
    set_alarm_icon(hass.states[mpxLevelAlarm].state, this.querySelector("#mpx_level_alarm"));
    set_alarm_icon(hass.states[rdsLevelAlarm].state, this.querySelector("#rds_level_alarm"));
  
    const imageElement = this.querySelector(".image-container img");
  
    if (isLightBackgroundColor()) {
      imageElement.src = imgUrlDark;
    } else {
      imageElement.src = imgUrlLight;
    }

    let rfAlarmState = hass.states[rfLevelAlarm].state;
    let mpxAlarmState = hass.states[mpxLevelAlarm].state;
    let rdsAlarmState = hass.states[rdsLevelAlarm].state;
    
    let anyAlarmTriggered = rfAlarmState === "Alarm LOW" || rfAlarmState === "Alarm HIGH" || 
                           mpxAlarmState === "Alarm LOW" || mpxAlarmState === "Alarm HIGH" ||
                           rdsAlarmState === "Alarm LOW" || rdsAlarmState === "Alarm HIGH";
  
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
