import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoComponent } from './photo.component';

describe('PhotoComponent', () => {
  let component: PhotoComponent;
  let fixture: ComponentFixture<PhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PhotoComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoComponent);
    component = fixture.componentInstance;
    
    component.photo = {
      albumId: 1,
      photoId: 1,
      title: 'Test Photo',
      url: 'test.jpg'
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct photo data', () => {
    expect(component.photo.title).toBe('Test Photo');
    expect(component.photo.url).toBe('test.jpg');
  });

  it('should render photo image', () => {
    const compiled = fixture.nativeElement;
    const img = compiled.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('test.jpg');
  });
});