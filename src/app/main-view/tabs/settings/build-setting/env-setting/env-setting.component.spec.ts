import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvSettingComponent } from './env-setting.component';

describe('EnvSettingComponent', () => {
  let component: EnvSettingComponent;
  let fixture: ComponentFixture<EnvSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnvSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
