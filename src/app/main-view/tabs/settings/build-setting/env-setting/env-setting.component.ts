import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ElectronService } from '../../../../../core/services';
import { EnvOptions, SettingsGuard, SettingsService } from '../../../../../services/settings.service';

@Component({
  selector: 'app-env-setting',
  templateUrl: './env-setting.component.html',
  styleUrls: ['./env-setting.component.scss']
})
export class EnvSettingComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private settingsService: SettingsService,
    private electronService: ElectronService,
    private settingsGuard: SettingsGuard) {
    this.route.url.subscribe((url) => {
      this.settingsGuard.lastVisitedUrl['build'] = url[0].path;
    });
  }

  currentEncoding = new Subject<string>();
  currentEncodingValid = true;

  get currentEnvOptions(): EnvOptions {
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

  onChange(): void {
    this.settingsService.onChange('build');
  }

  verify(): void {
    this.currentEncoding.next(this.currentEnvOptions.ioEncoding);
  }

  async getDefaultEncoding(): Promise<void> {
    const cp = await this.electronService.ipcRenderer.invoke('encode/getAcp');
    this.currentEnvOptions.ioEncoding = cp;
    this.onChange();
    this.verify();
  }

}
