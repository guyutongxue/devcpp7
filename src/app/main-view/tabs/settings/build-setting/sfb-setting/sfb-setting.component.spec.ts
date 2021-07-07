import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfbSettingComponent } from './sfb-setting.component';

describe('SfbSettingComponent', () => {
  let component: SfbSettingComponent;
  let fixture: ComponentFixture<SfbSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SfbSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SfbSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
