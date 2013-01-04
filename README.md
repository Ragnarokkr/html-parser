# htmlparser
Simple HTML Parser / Serializer library for JavaScript.

## Getting Started
Usually, all my public repos are published on [GitHub][github-repo]
and mirrored on [BitBucket][bitbucket-repo].

For developing purposes only I suggest to use [bower][bower-link]
which will locally install this library as component in your project.
Instead, if you want to customize and/or recompile the library, it's
possibile to fork the repo and clone it locally on your computer.

### Customization and Recompilation
Once installed, if you want to customize/compile and test the sources,
type in terminal:
```bash
npm install
```
and all the required development dependencies will be locally installed.

To obtain a list of all available commands, just type in terminal:
```bash
grunt -h
```

## Documentation
This library can be used in all the cases when you need to traverse
a DOM tree (the whole document or just part of it) and get a processed
(maybe totally different) result.

Further details can be found into the documentation (currently not
provided online), which can be generated with:
```bash
grunt documenting
```
or
```bash
grunt jsdoc
```
Once the documentation is ready, you can navigate with your browser to
`./doc/index.html`.

## Usage
Using this library is really a piece of cake. These the required steps:

* to create an **iterator** (a DOM's Node class instance);
* to instantiate a `Serializer` object
* to instantiate a `Parser` object passing `iterator`, `serializer`, and
  optional settings as parameters;
* to register the listeners for the Serializer's events
* to start the parsing process.

That's it. Nothing more nothing less. Here's an example:

```js
// first we define our variables
var iterator = document.getElementById( 'container' ),
    serializer = HTMLParser.Serializer(),
    parser = HTMLParser.Parser( iterator, serializer, {
      ignoreWhitespace: true,
      ignoreRootNode: true
    });

// then we define our listeners
serializer.addListener( HTMLParser.Serializer.Events.ON_START, function( data ){
  data.buffer = 'LET\'S GO!';
}).addListener( HTMLParser.Serializer.Events.ON_FINISH, function( data ){
  data.buffer += ' and THAT\'S ALL FOLKS!';
});

// finally, let's the parser does its work and show the results
parser.parse();
console.log( parser.getResults() );
```
As you can see, this is a very basic example that doesn't anything
special. But I hope you now have figured out its behaviour.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing
coding style.
Add unit tests for any new or changed functionality. Lint and test your
code using [grunt](https://github.com/cowboy/grunt).

## Release History
Read the CHANGELOG.md file distributed with the project.

## License
Read the LICENSE-MIT file distributed with the project.

[github-repo]: https://github.com/Ragnarokkr
[bitbucket-repo]: http://git.marcotrulla.it
[bower-link]: http://twitter.github.com/bower/
