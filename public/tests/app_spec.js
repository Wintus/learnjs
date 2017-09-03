'use strict';

describe('LearnJS', function() {
  it('can show a problem view', function () {
    learnjs.showView('#problem-1');
    expect($('.view-container .problem-view')).toHaveLength(1);
  });

  it('shows the landing page view when there is no hash', function () {
    learnjs.showView('');
    expect($('.view-container .landing-view')).toHaveLength(1);
  });

  it('passes the hash view parameter to the view function', function () {
    spyOn(learnjs, 'problemView');
    learnjs.showView('#problem-42');
    expect(learnjs.problemView).toHaveBeenCalledWith('42');
  });

  it('triggers removingView event when removing the view', function() {
    spyOn(learnjs, 'triggerEvent');
    learnjs.showView('#problem-1');
    expect(learnjs.triggerEvent).toHaveBeenCalledWith('removingView', []);
  });

  it('invokes the router when loaded', function () {
    spyOn(learnjs, 'showView');
    learnjs.appOnReady();
    expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
  });

  it('subscribes to the hash change event', function () {
    learnjs.appOnReady();
    spyOn(learnjs, 'showView');
    $(window).trigger('hashchange');
    expect(learnjs.showView).toHaveBeenCalledWith(window.location.hash);
  });

  it('can flash an element while setting the text', function() {
    var elem = $('<p>');
    var text = "new text";
    spyOn(elem, 'fadeOut').and.callThrough();
    spyOn(elem, 'fadeIn');
    learnjs.flashElement(elem, text);

    expect(elem).toHaveText(text);
    expect(elem.fadeOut).toHaveBeenCalled();
    expect(elem.fadeIn).toHaveBeenCalled();
  });

  it('can redirect to the main view after the last problem is answered', function() {
    var flash = learnjs.buildCorrectFlash(2);
    var link = flash.find('a');
    expect(link).toHaveAttr('href', '');
    expect(link).toHaveText("You're Finished!");
  });

  it('can trigger events on the view', function() {
    var callback = jasmine.createSpy('callback');
    var foo = 'fooEvent', bar = 'bar';
    var div = $('<div>').bind(foo, callback);
    $('.view-container').append(div);
    learnjs.triggerEvent(foo, [bar]);

    expect(callback).toHaveBeenCalled();
    expect(callback.calls.argsFor(0)[1]).toEqual(bar);
  });

  describe('problem view', function() {
    var view;
    beforeEach(function() {
      view = learnjs.problemView('1');
    });

    it('has a title that includes the problem number', function() {
      expect(view.find('.title')).toHaveText('Problem #1');
    });

    it('shows the description', function() {
      expect(view.find('[data-name="description"]')).toHaveText('What is truth?');
    });

    it('shows the problem code', function() {
      expect(view.find('[data-name="code"]')).toHaveText("function problem() { return __; }");
    });

    describe('skip button', function() {
      it('is added to the navbar when the view is added', function() {
        expect($('.nav-list .skip-btn')).toHaveLength(1);
      });

      it('is removed from the navbar when the view is removed', function() {
        view.trigger('removingView');
        expect($('.nav-list .skip-btn')).toHaveLength(0);
      });

      it('contains a link to the next problem', function() {
        expect($('.nav-list .skip-btn')).toHaveLength(1);
      });

      it('does not added when at the last problem', function() {
        view.trigger('removingView');
        view = learnjs.problemView(2);
        expect($('.nav-list .skip-btn')).toHaveLength(0);
      });
    });

    describe('answer section', function() {
      var resultFlash;
      beforeEach(function() {
        spyOn(learnjs, 'flashElement');
        resultFlash = view.find('.result');
      });

      describe('when the answer is correct', function() {
        beforeEach(function() {
          view.find('.answer').val('true');
          view.find('.check-btn').click();
        });

        it('flashes the result', function() {
          var flashArgs = learnjs.flashElement.calls.argsFor(0);
          expect(flashArgs[0]).toEqual(resultFlash);
          expect(flashArgs[1].find('span')).toHaveText('Correct!');
        });

        it('shows a link to the next problem', function() {
          var link = learnjs.flashElement.calls.argsFor(0)[1].find('a');
          expect(link).toHaveText('Next Problem');
          expect(link).toHaveAttr('href', '#problem-2');
        });
      });

      it('can reject an incorrect answer', function() {
        view.find('.answer').val('false');
        view.find('.check-btn').click();
        expect(learnjs.flashElement).toHaveBeenCalledWith(resultFlash, 'Incorrect!');
      });
    });
  });

  // Auth
  describe('awsRefresh', function() {
    let callbackArg, fakeCreds;
    const cognitoId = 'COGNITO_ID';

    beforeEach(function() {
      fakeCreds = jasmine.createSpyObj('creds', ['refresh']);
      fakeCreds.identityId = cognitoId;
      AWS.config.credentials = fakeCreds;
      fakeCreds.refresh.and.callFake(function(cb) { cb(callbackArg) });
    });

    // see: https://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support

    it('returns a promise that resolves on success', function(done) {
      learnjs.awsRefresh().then(function(id) {
        expect(fakeCreds.identityId).toEqual(cognitoId);
      }).then(done, fail);
    });

    it('rejects the promise on failure', function(done) {
      const error = "error"

      callbackArg = error;
      learnjs.awsRefresh().fail(function(err) {
        expect(err).toEqual(error);
        done();
      });
    });
  });

  describe('profile view', function() {
    let view;
    beforeEach(function() {
      view = learnjs.profileView();
    });

    // FIXME: stateful

    it('shews no email address when they are not logged in yet', function() {
      expect(view.find('.email')).toHaveText('');
    });

    it('shows the users email address when they log in', function() {
      const address = 'foo@bar.com';
      learnjs.identity.resolve({
        email: address
      });
      expect(view.find('.email')).toHaveText(address);
    });
  });
});
