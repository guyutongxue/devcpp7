import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildControlComponent } from './build-control.component';

describe('BuildControlComponent', () => {
  let component: BuildControlComponent;
  let fixture: ComponentFixture<BuildControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuildControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
