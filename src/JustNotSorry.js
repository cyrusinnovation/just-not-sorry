function refresh(f) {
  'use strict';
  if ((/loading/.test(document.readyState)) ||
      (window.jQuery === undefined) ||
      (window.Gmail === undefined) ||
      (window.WARNINGS === undefined)) {
    setTimeout('refresh(' + f + ')', 10);
  } else {
    f();
  }
}

var JustNotSorry = function() {
  'use strict';
  var gmail;
  var warningChecker;

  function checkForWarnings(compose, type) {
    var observer = new MutationObserver(function() {
      var body = compose.dom('body');
      var caretPosition = body.caret('pos');
      warningChecker.removeWarnings(body);
      warningChecker.addWarnings(body);
      body.caret('pos', caretPosition);
    });

    var target = compose.$el.get(0);
    var config = {characterData: true, subtree: true};
    observer.observe(target, config);
  }

  function cleanupWarnings(url, body, data, xhr) {
    var bodyParams = xhr.xhrParams.body_params;

    var oldCmml = xhr.xhrParams.url.cmml;

    var existingBody = bodyParams.body;
    var newBody = warningChecker.removeWarnings($(existingBody));

    if (newBody.length > oldCmml) {
      xhr.xhrParams.url.cmml = newBody.length;
    } else {
      newBody += '<div>';
      while (newBody.length < oldCmml) {
        newBody += ' ';
      }

      newBody += '</div>';
      xhr.xhrParams.url.cmml = newBody.length;
    }

    bodyParams.body = newBody;
  }

  gmail = new Gmail();
  warningChecker = new WarningChecker(WARNINGS);
  gmail.observe.on('compose', checkForWarnings);
  gmail.observe.before('send_message', cleanupWarnings);
};

refresh(JustNotSorry);