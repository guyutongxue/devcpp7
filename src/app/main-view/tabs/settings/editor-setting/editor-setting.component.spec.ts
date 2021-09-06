import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorSettingComponent } from './editor-setting.component';

describe('EditorSettingComponent', () => {
  let component: EditorSettingComponent;
  let fixture: ComponentFixture<EditorSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
