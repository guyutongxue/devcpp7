import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildSettingComponent } from './build-setting.component';

describe('BuildSettingComponent', () => {
  let component: BuildSettingComponent;
  let fixture: ComponentFixture<BuildSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuildSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
