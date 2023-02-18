import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailNumberPromptComponent } from './tail-number-prompt.component';

describe('TailNumberPromptComponent', () => {
  let component: TailNumberPromptComponent;
  let fixture: ComponentFixture<TailNumberPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TailNumberPromptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TailNumberPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
