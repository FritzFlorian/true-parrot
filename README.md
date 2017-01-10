# True Parrot
True Parrot is a small twitter like web app using node.js and hapi for learning purpose.
The goal is to get an overview of building web apps using node.

Try the app on heroku: https://true-parrot.herokuapp.com/

## Run

To run the app you will have to setup an local mongo db server.
Then simply clone the repo, run `npm install` and then run `npm run start`.

## Environment Variables

Some environment variables are required on all environments (dev, test, production),
others are just needed in production.

The following variables are required in all environments:

| Variable Name    | Variable Value           |
|------------------|--------------------------|
|CLOUDINARY_NAME   | Your cloudinary name. See http://cloudinary.com/documentation/node_integration#configuration |
|CLOUDINARY_KEY    | Your cloudinary key. See http://cloudinary.com/documentation/node_integration#configuration |
|CLOUDINARY_SECRET | Your cloudinary secret. See http://cloudinary.com/documentation/node_integration#configuration |
|NODE_ENV          | One of: production, dev, test |


The following variables should be set in a production enviroment:

| Variable Name    | Variable Value           |
|------------------|--------------------------|
|PORT              | Application Port, defaults to 4000 |
|COOKIE_PASSWORD   | Password used for cookies, must be set in production |
|JWT_PASSWORD      | Password used to encode JWT token, must be set in production |
|MONGOLAB_URI      | The full monoglab connection URI, must be set in production |

Important: to run the tests the NODE_ENV has to be set to test.

## Test and Code Coverage

To run the tests use `npm run test`.

Note on testing in the Webstorm IDE:
You need to set the environment variable `NODE_ENV` to `test` to run the test.

To run code coverage use `npm run coverage`.

The coverage rate is low as there are only tests for the api, not the static html pages.
The result of the coverage can be viewed in `coverage/lcov-report/index.html`.

## Seeding

To seed the app run `npm run seed`. 
The remote Heroku app can be seeded using `heroku run npm run seed`.

## Hosting Providers Used

The project is setup to work with specific hosting providers. It can easily be adobpted to others, but
these are the ones you will need an account for usually.

| Hoster           | Usage                    |
|------------------|--------------------------|
| Heroku           | Used to run the main node application |
| MLab             | Used for a free mongo database |
| Cloudinary       | Used for image hosting |

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
