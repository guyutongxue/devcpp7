import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../../../core/services';
import { SettingsService } from '../../../../../services/settings.service';

@Component({
  selector: 'app-sfb-setting',
  templateUrl: './sfb-setting.component.html',
  styleUrls: ['./sfb-setting.component.scss']
})
export class SfbSettingComponent implements OnInit {

  customArgsDivClass: string[] = []

  constructor(private settingsService: SettingsService) { }

  stdOptions = [
    '98',
    '11',
    '14',
    '17',
    '2a',
  ];
  optOptions = [
    '1', '2', '3', 's', 'fast', 'g'
  ]

  listOfTagOptions = [];

  ngOnInit() {
    console.log(this.currentOptions);
  }

  onChange() {
    this.settingsService.buildOptionTab.saved.next(false);
  }

  get currentOptions() {
    return this.settingsService.currentSfbOptions;
  }

  get buildedArgs() {
    return this.currentOptions.toList();
  }

  customSubmit(value: string) {
    const index = this.currentOptions.other.indexOf(value);
    if (index === -1) {
      this.currentOptions.other.push(value);
      this.onChange();
    }
  }
  customRemove(value: string) {
    this.onChange();
    const index = this.currentOptions.other.indexOf(value);
    if (index !== -1) {
      this.currentOptions.other.splice(index, 1);
      this.onChange();
    }
  }
  removeLast() {
    if (this.currentOptions.other.length > 0) {
      this.onChange();
      this.currentOptions.other.pop();
    }
  }
}
