import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyResumes } from './my-resumes';

describe('MyResumes', () => {
  let component: MyResumes;
  let fixture: ComponentFixture<MyResumes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyResumes],
    }).compileComponents();

    fixture = TestBed.createComponent(MyResumes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
