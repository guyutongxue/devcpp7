import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ElectronService } from '../../../../../core/services';
import { SettingsService } from '../../../../../services/settings.service';

@Component({
  selector: 'app-env-setting',
  templateUrl: './env-setting.component.html',
  styleUrls: ['./env-setting.component.scss']
})
export class EnvSettingComponent implements OnInit {

  constructor(private settingsService: SettingsService, private electronService: ElectronService) { }

  currentEncoding: Subject<string> = new Subject<string>();
  currentEncodingValid: boolean = true;

  get currentEnvOptions() {
    return this.settingsService.getOptions('build').env;
  }

  ngOnInit(): void {
    this.currentEncoding.pipe(
      debounceTime(200)
    ).subscribe(e => {
      this.electronService.ipcRenderer.invoke('encode/verify', e)
        .then(r => this.currentEncodingValid = r);
    });
  }

  onChange() {
    this.settingsService.onChange('build');
  }

  verify() {
    this.currentEncoding.next(this.currentEnvOptions.ioEncoding);
  }

  async getDefaultEncoding() {
    const cp = await this.electronService.ipcRenderer.invoke('encode/getCp');
    this.currentEnvOptions.ioEncoding = cp;
    this.onChange();
    this.verify();
  }

}
