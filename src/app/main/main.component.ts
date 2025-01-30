import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Album, AlbumService, Photo } from '../services/album-service';
import { PhotoComponent } from '../photo/photo.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PhotoComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  private destroy$ = new Subject<void>();
  originalAlbums: Album[] = [];
  filteredAlbums: Album[] = [];
  isLoading = true;
  searchControl = new FormControl('', [
    Validators.maxLength(40),
    Validators.pattern(/^[a-zA-Z0-9\s-]*$/),
  ]);
  selectedPhoto: Photo | null = null;

  constructor(
    private albumService: AlbumService
  ) {}

  ngOnInit(): void {
    this.getAlbums();
  }

  getAlbums(): void {
    this.albumService.getAlbums()
      .subscribe({
        next: (response) => {
          this.originalAlbums = response;
          this.filteredAlbums = this.originalAlbums;
          this.setupSearch();
          this.preloadImages();
        },
        error: (error) => {
          console.error('Error fetching albums:', error);
          this.isLoading = false;
        }
      });
  }

  setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      if (this.searchControl.valid && searchTerm !== null) {
        this.filteredAlbums = this.albumService.filterAlbums(this.originalAlbums, searchTerm);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  preloadImages(): void {
    const imagePromises: Promise<void>[] = [];
    this.filteredAlbums = [];
    
    // Add a failsafe timeout promise in case an image never loads, 
    // so app doesn't stay in loading forever
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('Image loading timed out after 7 seconds');
        resolve();
      }, 7000);
    });
    
    // Create image loading promises
    this.originalAlbums.forEach(album => {
      album.photos.forEach(photo => {
        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => {
            console.error(`Failed to load image: ${photo.url}`);
            resolve();
          };
          img.src = photo.url;
        });
        imagePromises.push(promise);
      });
    });

    // Race between all images loading and timeout
    Promise.race([
      Promise.all(imagePromises),
      timeoutPromise
    ]).then(() => {
      this.isLoading = false;
      // requestAnimationFrame more performant than setTimeout
      requestAnimationFrame(() => {
        this.filteredAlbums = this.originalAlbums;
        requestAnimationFrame(() => {
          if (this.searchInput?.nativeElement) {
            this.searchInput.nativeElement.focus();
          }
        });
      });
    });
  }

  showPhoto(photo: Photo): void {
    this.selectedPhoto = photo;
  }

  clearSearch(input: HTMLInputElement): void {
    // requestAnimationFrame more performant than setTimeout
    requestAnimationFrame(() => {
      this.filteredAlbums = this.originalAlbums;
      this.searchControl.setValue('');
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        input.focus();
      });
    });
  }

  get searchError(): string {
    if (this.searchControl.hasError('maxlength')) {
      return 'Search term cannot exceed 40 characters';
    }
    if (this.searchControl.hasError('pattern')) {
      return 'Only letters, numbers, spaces, and hyphens are allowed';
    }
    return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
