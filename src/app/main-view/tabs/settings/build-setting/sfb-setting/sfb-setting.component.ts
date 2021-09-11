import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SettingsGuard, SettingsService, SfbOptions } from '../../../../../services/settings.service';

@Component({
  selector: 'app-sfb-setting',
  templateUrl: './sfb-setting.component.html',
  styleUrls: ['./sfb-setting.component.scss']
})
export class SfbSettingComponent implements OnInit {

  customArgsDivClass: string[] = [];

  constructor(private settingsService: SettingsService,
    private settingsGuard: SettingsGuard) {
  }

  stdOptions = [
    '98',
    '11',
    '14',
    '17',
    '20',
  ];
  optOptions = [
    '1', '2', '3', 's', 'fast', 'g'
  ];

  ngOnInit(): void {
    console.log(this.currentOptions);
    this.settingsGuard.lastVisitedUrl['~build'] = 'sfb';
  }

  onChange(): void {
    this.settingsService.onChange('build');
  }

  get currentOptions(): SfbOptions {
    return this.settingsService.getOptions('build').sfb;
  }

  get buildedArgs(): string[] {
    return this.currentOptions.toList();
  }

  customSubmit(value: string): void {
    const index = this.currentOptions.other.indexOf(value);
    if (index === -1) {
      this.currentOptions.other.push(value);
      this.onChange();
    }
  }
  customRemove(value: string): void {
    this.onChange();
    const index = this.currentOptions.other.indexOf(value);
    if (index !== -1) {
      this.currentOptions.other.splice(index, 1);
      this.onChange();
    }
  }
  removeLast(): void {
    if (this.currentOptions.other.length > 0) {
      this.onChange();
      this.currentOptions.other.pop();
    }
  }
}
