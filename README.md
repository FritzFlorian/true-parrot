# True Parrot
True Parrot is a small twitter like web app using node.js and hapi for learning purpose.
The goal is to get an overview of building web apps using node.

Try the app on heroku: https://true-parrot.herokuapp.com/

## Run

To run the app you will have to setup an local mongo db server.
Then simply clone the repo, run `npm install` and then run `npm run start`.

## Test and Code Coverage

To run the tests use `npm run test`.

Note on testing in the Webstorm IDE:
You need to set the environment variable `NODE_ENV` to `test` to run the test.

To run code coverage use `npm run coverage`.

The coverage rate is low as there are only tests for the api, not the static html pages.
The result of the coverage can be viewed in `coverage/lcov-report/index.html`.

## Attribution

A list of attributions of content used in this project:

- Parrot Logo:
  - Source: https://thenounproject.com/term/parrot/6090/
  - Author: Cengiz SARI, https://thenounproject.com/cengizsari/
- Round Parrot:
  - Source: https://thenounproject.com/term/parrot/210502/
  - Author: Andrey Krylov, https://thenounproject.com/kryptonlove/
  - Notes: Changed color to a green variant
- Parrot Background:
  - Source: https://www.flickr.com/photos/mdpettitt/2744081052/
  - Author: Martin Pettitt, https://www.flickr.com/photos/mdpettitt/
  - Notes: Edited the Image (darker/blured as background graphic)
- jQuery Masonry:
  - Source: http://masonry.desandro.com
  - Author: David DeSandro
  - License: MIT, https://desandro.mit-license.org/
- jQuery Images Loaded:
  - Source: https://github.com/desandro/imagesloaded
  - Author David DeSandro
  - License: MIT, https://desandro.mit-license.org/
- Charts.js:
  - Source: https://github.com/chartjs/Chart.js
  - Author: Nick Downie
  - License: MIT, https://github.com/chartjs/Chart.js/blob/master/LICENSE.md
