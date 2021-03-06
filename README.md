![](https://github.com/defmethodinc/just-not-sorry/workflows/Node.js%20CI/badge.svg) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Just Not Sorry -- the Chrome extension

Inspired by the writings of Tara Mohr and others, this Chrome Extension for Gmail and Outlook.com will warn you when you use phrases that might be undermining your message.

The Chrome Extension can be found at https://chrome.google.com/webstore/detail/just-not-sorry-the-gmail/fmegmibednnlgojepmidhlhpjbppmlci?hl=en-US

## Citations

- http://www.taramohr.com/8-ways-women-undermine-themselves-with-their-words/
- http://goop.com/how-women-undermine-themselves-with-words/
- http://www.fastcompany.com/3032112/strong-female-lead/sorry-not-sorry-why-women-need-to-stop-apologizing-for-everything
- http://www.fastcompany.com/3049609/the-future-of-work/4-types-of-useless-phrases-you-need-to-eliminate-from-your-emails
- http://jezebel.com/google-exec-women-stop-saying-just-so-much-you-sound-1715228159
- http://www.lifehack.org/articles/communication/7-things-not-to-say-and-7-things-to-start-saying.html

## Contributing

### Requests to add or change warning phrases

Please [create a GitHub issue](https://github.com/defmethodinc/just-not-sorry/issues/new) with your request.

If you're a developer, you're welcome to submit a pull request. Please run the tests before submitting, as they will validate the format of the message.

**NOTE:** All warning phrases must include a link to an article that explains why the phrase could negatively impact someone's message. If available, please also include alternative wording suggestions from the article.

### Development Setup

Prerequisites:

- [git](https://git-scm.com/)
- [node.js 12.X+](https://nodejs.org/)

Setup:

- `git clone` the repo
- Run `npm install` in the project root
- Run `npm run start:chrome` to build the extension in watch mode and start a fresh chrome browser session with the extension loaded. Any changes you make to the code will result in the extension being reloaded. You might need to reload the gmail web page for them to show up, though.

You can also load the extension manually in Chrome using the following steps:

- Run `npm run build` in the project root to build the extension
- Follow the [instructions on the Chrome docs](https://developer.chrome.com/extensions/getstarted#unpacked) to load the unpacked extension using the `build` subdirectory
- Go to Gmail (or outlook.com) and open a compose window
- If you make changes to the code, click the Reload link on the `chrome://extensions` page and then reload your Gmail tab to pick up the changes.
- Errors will show up in the console

### Coding Standards

[Prettier](https://prettier.io/) is used to enforce code style and [eslint](https://eslint.org/) is used to check for best practices. Both are enforced automatically at commit time using [lint-staged](https://github.com/okonet/lint-staged) and [husky](https://github.com/typicode/husky).

### Commit Message Conventions

Commit messages are required to follow the [AngularJS's commit message convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines). This allows us to automatically increment the version numbering of the extension using the [SemVer](https://semver.org/) standard and generate release notes. We use the [Commitizen](https://github.com/commitizen/cz-cli) library to provide interactive prompts to help generate the commit messages. Once you've run `npm install` as instructed in the development setup section, Commitizen will be run whenever you execute the `git commit` command.

### Enzyme Tests

Tests are written using [enzyme](https://github.com/enzymejs/enzyme). They can either be run from the command line using:

```
npm test
```

To run the tests watch mode, use:

```
npm run test:watch
```

### To Publish a New Version to Chrome Webstore

This project uses the [semantic-release](https://semantic-release.gitbook.io/semantic-release/) library and [GitHub Actions](https://help.github.com/en/actions) to automate the release process. Once a pull request has been merged into the master branch, a new [GitHub release](https://github.com/defmethodinc/just-not-sorry/releases) will be created. A zip file containing the updated files for the Chrome web store will be attached.

To publish this release, download the zip file from GitHub. Find the Just Not Sorry extension on the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/) (credentials available to DefMethod developers upon request), upload the zip file, and click the "Publish Item" button.

### Libraries Used

For production:

- [dom-regexp-match](https://github.com/webmodules/dom-regexp-match)
- [chrome-platform-analytics](https://github.com/GoogleChrome/chrome-platform-analytics)
- Based on [gmail-chrome-extension-boilerplate](https://github.com/KartikTalwar/gmail-chrome-extension-boilerplate)
- [preact/compat](https://github.com/preactjs/preact-compat)

For test:

- [enzyme](https://github.com/enzymejs/enzyme)
- [jest](https://github.com/facebook/jest)
- [jest-enzyme](https://www.npmjs.com/package/jest-enzyme)

### License

Just Not Sorry is Copyright © 2015-20 Def Method, Inc. It is free software, and may be redistributed under the terms specified in the (MIT) LICENSE file.
