import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AlbumService, Album } from './album-service';

describe('AlbumService', () => {
  let service: AlbumService;
  let httpMock: HttpTestingController;

  const mockAlbums: Album[] = [
    {
      albumId: 2,
      photos: [
        { albumId: 2, photoId: 1, title: 'First photo', url: 'url1' },
        { albumId: 2, photoId: 2, title: 'Second photo', url: 'url2' }
      ]
    },
    {
      albumId: 1,
      photos: [
        { albumId: 1, photoId: 3, title: 'Third photo', url: 'url3' }
      ]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AlbumService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AlbumService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAlbums', () => {
    it('should fetch and sort albums by albumId', () => {
      service.getAlbums().subscribe(albums => {
        expect(albums.length).toBe(2);
        expect(albums[0].albumId).toBe(1);
        expect(albums[1].albumId).toBe(2);
      });

      const req = httpMock.expectOne('/albums');
      expect(req.request.headers.get('lt_api_key')).toBe('lt_tech_showcase');
      req.flush(mockAlbums);
    });
  });

  describe('filterAlbums', () => {
    it('should return all albums when search term is empty', () => {
      const result = service.filterAlbums(mockAlbums, '');
      expect(result).toEqual(mockAlbums);
    });

    it('should filter albums by albumId', () => {
      const result = service.filterAlbums(mockAlbums, '2');
      expect(result.length).toBe(1);
      expect(result[0].albumId).toBe(2);
    });

    it('should filter albums by photo title', () => {
      const result = service.filterAlbums(mockAlbums, 'First');
      expect(result.length).toBe(1);
      expect(result[0].photos.length).toBe(1);
      expect(result[0].photos[0].title).toBe('First photo');
    });

    it('should filter albums by photoId', () => {
      const result = service.filterAlbums(mockAlbums, '3');
      expect(result.length).toBe(1);
      expect(result[0].albumId).toBe(1);
      expect(result[0].photos[0].photoId).toBe(3);
    });

    it('should return empty array when no matches found', () => {
      const result = service.filterAlbums(mockAlbums, 'nonexistent');
      expect(result.length).toBe(0);
    });
  });
});