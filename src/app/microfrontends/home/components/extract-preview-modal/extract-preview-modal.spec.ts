import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractPreviewModal } from './extract-preview-modal';

describe('ExtractPreviewModal', () => {
  let component: ExtractPreviewModal;
  let fixture: ComponentFixture<ExtractPreviewModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtractPreviewModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ExtractPreviewModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
