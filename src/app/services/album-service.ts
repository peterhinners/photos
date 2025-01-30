import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Photo {
  albumId: number;
  photoId: number;
  title: string;
  url: string;
}

export interface Album {
  albumId: number;
  photos: Photo[];
}

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  constructor(private http: HttpClient) {}

  getAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>('/albums', {
      headers: { 'lt_api_key': 'lt_tech_showcase' }
    }).pipe(
      map(albums => albums.sort((a, b) => a.albumId - b.albumId))
    );
  }

  filterAlbums(albums: Album[], searchTerm: string): Album[] {
    if (!searchTerm) {
      return albums;
    }

    const term = searchTerm.toLowerCase();
    return albums
      .map(album => {
        if (album.albumId.toString().includes(term)) {
          return album;
        }
        
        const matchingPhotos = album.photos.filter(photo => 
          photo.title.toLowerCase().includes(term) ||
          photo.photoId.toString().includes(term)
        );
        
        return matchingPhotos.length > 0 
          ? { albumId: album.albumId, photos: matchingPhotos }
          : null;
      })
      .filter(album => album !== null);
  }
}