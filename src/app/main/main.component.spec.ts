import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { AlbumService } from '../services/album-service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let albumServiceSpy: jasmine.SpyObj<AlbumService>;

  const mockAlbums = [
    {
      albumId: 1,
      photos: [
        {
          albumId: 1,
          photoId: 1,
          title: 'Test Photo 1',
          url: 'test1.jpg'
        },
        {
          albumId: 1,
          photoId: 2,
          title: 'Test Photo 2',
          url: 'test2.jpg'
        }
      ]
    },
    {
      albumId: 2,
      photos: [
        {
          albumId: 2,
          photoId: 3,
          title: 'Another Photo',
          url: 'test3.jpg'
        }
      ]
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AlbumService', ['getAlbums', 'filterAlbums']);
    spy.getAlbums.and.returnValue(of(mockAlbums));
    spy.filterAlbums.and.callFake((albums: any[], searchTerm: string) => {
      if (!searchTerm) {
        return albums;
      }
      return [];
    });

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MainComponent
      ],
      providers: [
        { provide: AlbumService, useValue: spy }
      ]
    }).compileComponents();

    albumServiceSpy = TestBed.inject(AlbumService) as jasmine.SpyObj<AlbumService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    component.originalAlbums = mockAlbums;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load albums on init', () => {
    spyOn(component, 'setupSearch');
    spyOn(component, 'preloadImages');
    
    component.ngOnInit();
    
    expect(albumServiceSpy.getAlbums).toHaveBeenCalled();
    expect(component.filteredAlbums).toBeDefined();
    expect(component.filteredAlbums.length).toBe(2);
    expect(component.filteredAlbums).toEqual(mockAlbums);
    expect(component.setupSearch).toHaveBeenCalled();
    expect(component.preloadImages).toHaveBeenCalled();
  });

  it('should filter albums when search term changes', fakeAsync(() => {
    albumServiceSpy.filterAlbums.and.returnValue([mockAlbums[0]]);
    component.searchControl.setValue('Test Photo 1');
    tick(300);

    expect(component.filteredAlbums.length).toBe(1);
    expect(component.filteredAlbums[0].photos[0].title).toBe('Test Photo 1');
  }));

  it('should show all albums when search is cleared', fakeAsync(() => {
    albumServiceSpy.filterAlbums.and.returnValue([mockAlbums[0]]);
    
    component.searchControl.setValue('some search');
    tick(300);
    
    expect(component.filteredAlbums).toEqual([mockAlbums[0]]);

    albumServiceSpy.filterAlbums.and.returnValue(mockAlbums);
    
    const input = document.createElement('input');
    component.clearSearch(input);
    tick(300);
    
    expect(component.filteredAlbums).toEqual(mockAlbums);
  }));

  it('should handle search with no results', fakeAsync(() => {
    albumServiceSpy.filterAlbums.and.returnValue([]);
    component.searchControl.setValue('NonexistentPhoto');
    tick(300);

    expect(component.filteredAlbums.length).toBe(0);
  }));

  it('should validate search input', () => {
    component.searchControl.setValue('a'.repeat(41));
    expect(component.searchControl.errors?.['maxlength']).toBeTruthy();

    component.searchControl.setValue('invalid@character');
    expect(component.searchControl.errors?.['pattern']).toBeTruthy();

    component.searchControl.setValue('valid-search-123');
    expect(component.searchControl.errors).toBeNull();
  });

  it('should preload images when initialized', fakeAsync(() => {
    component.isLoading = true;
    component.filteredAlbums = [];
    
    component.searchInput = {
      nativeElement: {
        focus: () => {}
      }
    } as ElementRef;
    
    // Create a mock image with onload handler
    let resolves: (() => void)[] = [];
    spyOn(window, 'Image').and.returnValue({
      set onload(resolve: () => void) {
        resolves.push(resolve);
      },
      set src(_url: string) {
        // Simulate image load when src is set
        setTimeout(() => {
          resolves.forEach(resolve => resolve());
        }, 100);
      }
    } as any);
    
    spyOn(component.searchInput.nativeElement, 'focus');

    component.preloadImages();
    
    tick(1000);  // Wait for image load simulations
    flush();     // Flush any remaining microtasks

    expect(window.Image).toHaveBeenCalledTimes(3);
    expect(component.isLoading).toBe(false);
    expect(component.filteredAlbums).toEqual(mockAlbums);
    expect(component.searchInput.nativeElement.focus).toHaveBeenCalled();
  }));
});