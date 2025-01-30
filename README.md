# Photos

Hello there! 

I was hoping to get this project up on Stackblitz for you (for ease of viewing), but there is a known issue with Stackblitz where it won't use your proxy settings (to override a CORS issue with retrieving the photos). So I think the next best option is to run this locally or to have me screenshare.

To run this Angular project locally, you'll need to have Angular installed on your computer (https://angular.dev/installation).

Once you have Angular installed, or if you've already installed it, you'll want to clone this repo.

Maybe setup a folder to run the project in, and cd into that folder within a terminal. 

Once inside that folder, run:

```bash
git clone https://github.com/peterhinners/photos.git
```

Then once that's created, cd into this project ("photos").

Run:

```bash
npm install
```

Then, to start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. 

You should see a loading animation as the photos are loading (if you don't, it may have already finished... might be worth refreshing the page to see it :-)

## Running unit tests

I also added unit tests for this project. To run them, stop the server and run:

```bash
ng test
```

## Things to note

It really bothered me at first how the photos would appear to load one by one, so I spent some time adding some "preloading" functionality, that should hopefully make all the photos appear at once.

Added the loading animation as the user waits.

Clearing out a search should also cause all photos to appear right away.

The header and search input are sticky, so as you scroll down, you can still input search terms.

Inputting a search term should scroll you back to the top of the page.

Same with clearing the search term.

There is some validation on the search input, to make sure the user only inputs letters, numbers, spaces, and hyphens (and a term 40 characters or less).

As mentioned earlier, I had a CORS issue retrieving the photos initially, but a proxy was added to the project to override that.

Clicking on an individual photo should open a modal with the photo.

Both the modal view and the main list view photos have that "Ken Burns" photo effect, where the photo appears to slowly zoom in.

I'm using a famous favicon in the browser tab :-)

Thanks so much for your time! Looking forward to talking!
Pete

