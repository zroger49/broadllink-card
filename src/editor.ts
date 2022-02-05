/* eslint-disable @typescript-eslint/no-explicit-any */


import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { queryAsync } from "lit-element"
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionHandlerEvent, ActionConfig, hasAction, } from 'custom-card-helpers';
import { actionHandler } from "./action-handler-directive";
import { RemoteCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators';
import { localize } from './localize/localize';
import { discoverDevices } from './helpers'


@customElement('remote-card-editor')
export class RemoteCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: RemoteCardConfig;

  @state() private _toggle?: boolean;

  @state() private _helpers?: any;

  @property({ attribute: false }) preset?: string

  private _initialized = false;

  public setConfig(config: RemoteCardConfig): void {
    this._config = config;
    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _entity(): string {
    return this._config?.entity || '';
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  get _tap_action(): ActionConfig {
    return this._config?.tap_action || { action: 'more-info' };
  }

  get _hold_action(): ActionConfig {
    return this._config?.hold_action || { action: 'none' };
  }

  get _double_tap_action(): ActionConfig {
    return this._config?.double_tap_action || { action: 'none' };
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="discover">
          <ha-card
            @action=${this._handleAction}
            .actionHandler=${actionHandler({ hasHold: hasAction() })}>
                ${localize('editor.discover')}
          </ha-card>
        </div>
        <div class="option" .option=${'required'}>
        <paper-input-label-8>${localize('editor.remote')}</paper-input-label-8>
            <paper-dropdown-menu class="dropdown-icon">
              <paper-listbox slot="dropdown-content"
                attr-for-selected="value"
                @iron-select=${this._valueChanged}
                .configValue=${"selected_device_mac"}
                selected='1'>
                ${this._config?.all_devices === [] ?
                html`<paper-item>${localize('editor.no_broadlinks')}</paper-item>`
                : this._config?.all_devices.map(device => html`<paper-item value=${device.mac}><ha-icon .icon=${"mdi:remote"}></ha-icon>${this._formatDeviceDropdownOption(device)}</paper-item>`)}
              </paper-listbox>
            </paper-dropdown-menu>


            <div class= "div-options">
                <ha-card class = preset-card
                @action=${this._changePreset.bind(this, '1')}
                .actionHandler=${actionHandler({ hasHold: hasAction() })}>
                    1
                </ha-card>
                <ha-card class = preset-card
                @action=${this._changePreset.bind(this, '2')}
                .actionHandler=${actionHandler({ hasHold: hasAction() })}
                key='2'>
                    2
                </ha-card>
                <ha-card class = preset-card
                @action=${this._changePreset.bind(this, '3')}
                .actionHandler=${actionHandler({ hasHold: hasAction() })}
                key='3'>
                    3
                </ha-card>
                <ha-card class = preset-card
                @action=${this._changePreset.bind(this, '4')}
                .actionHandler=${actionHandler({ hasHold: hasAction() })}
                key='4'>
                    4
                </ha-card>
                <ha-card class = preset-card
                @action=${this._changePreset.bind(this, '5')}
                .actionHandler=${actionHandler({ hasHold: hasAction() })}
                key='5'>
                    5
                </ha-card>
          </div class= "div-options">

      </div class="card-config">
    </div class="option">
  </div class = "card-config">

    `;
  }


  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _handleAction (ev: ActionHandlerEvent): void {
    if (ev) {
      discoverDevices(this.hass)
    }
  }

  private _changePreset(key:string): void {
    if (!this._config || !this.hass) {
      return;
    }
    this._config = { ...this._config, preset: key }
    this.preset = key
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _formatDeviceDropdownOption(device):string {
    return device.device_type + " ("  + device.mac + ")"
  }


  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.selected) {
      return;
    }
    if (target.select === localize('editor.no_broadlinks')) {
      return
    }

    if (target.configValue) {
      if (target.selected === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.selected,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }


  static get styles(): CSSResultGroup {
    return css`
      ha-card{
        width: 40%;
        height: 30%;
        background-color: var(--primary-background-color);
        box-shadow: -2px -2px 5px #2c2c2c , 2px 2px 5px #191919;
        cursor: pointer;
      }
      ha-card.preset-card{
        width: 15%;
        padding: 2%;
        margin: 5%;
        float: left;
        text-align: center;
      }
      .div-options {
        width: 60%;
        display: flex;
        flex-wrap: wrap;
        padding: 30px 8px 8px;
        justify-content: flex-start;
        align-items: flex-start;
        flex-direction: row;
        align-content: stretch;
      }
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
        display: grid;
      }
      ha-formfield {
        padding-bottom: 8px;
      }
    `;
  }
}