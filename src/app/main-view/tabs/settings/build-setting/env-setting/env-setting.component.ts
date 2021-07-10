import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../../../core/services';
import { SettingsService } from '../../../../../services/settings.service';

@Component({
  selector: 'app-env-setting',
  templateUrl: './env-setting.component.html',
  styleUrls: ['./env-setting.component.scss']
})
export class EnvSettingComponent implements OnInit {

  constructor(private settingsService: SettingsService, private electronService: ElectronService) { }

  get currentEnvOptions() {
    return this.settingsService.getOptions('build').env;
  }

  ngOnInit(): void {
  }

  onChange() {
    this.settingsService.onChange('build');
  }

  async getDefaultEncoding() {
    const cp = await this.electronService.ipcRenderer.invoke('encode/getCp');
    this.currentEnvOptions.ioEncoding = cp;
  }

}
