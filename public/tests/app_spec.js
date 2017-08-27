'use strict';

describe('LearnJS', function() {
  it('can show a problem view', function () {
    learnjs.showView('#problem-1');
    expect($('.view-container .problem-view').length).toEqual(1);
  });

  it('shows the landing page view when there is no hash', function () {
    learnjs.showView('');
    expect($('.view-container .landing-view').length).toEqual(1);
  });

  it('passes the hash view parameter to the view function', function () {
    spyOn(learnjs, 'problemView');
    learnjs.showView('#problem-42');
    expect(learnjs.problemView).toHaveBeenCalledWith('42');
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

    expect(elem.text()).toEqual(text);
    expect(elem.fadeOut).toHaveBeenCalled();
    expect(elem.fadeIn).toHaveBeenCalled();
  });

  it('can redirect to the main view after the last problem is answered', function() {
    var flash = learnjs.buildCorrectFlash(2);
    var link = flash.find('a');
    expect(link.attr('href')).toEqual('');
    expect(link.text()).toEqual("You're Finished!");
  });

  describe('problem view', function() {
    var view;
    beforeEach(function() {
      view = learnjs.problemView('1');
    });

    it('has a title that includes the problem number', function() {
      expect(view.find('.title').text())
        .toEqual('Problem #1');
    });

    it('shows the description', function() {
      expect(view.find('[data-name="description"]').text())
        .toEqual('What is truth?');
    });

    it('shows the problem code', function() {
      expect(view.find('[data-name="code"]').text())
        .toEqual("function problem() { return __; }");
    });

    describe('skip button', function() {
      it('is added to the navbar when the view is added', function() {
        expect($('.nav-list .skip-btn').length).toEqual(1);
      });

      it('is removed from the navbar when the view is removed', function() {
        view.trigger('removingView');
        expect($('.nav-list .skip-btn').length).toEqual(0);
      });

      it('does not added when at the last problem', function() {
        view.trigger('removingView');
        view = learnjs.problemView(2);
        expect($('.nav-list .skip-btn').length).toEqual(0);
      });
    });

    describe('answer section', function() {
      it('can check a correct answer by hitting a button', function() {
        view.find('.answer').val('true');
        view.find('.check-btn').click();
        expect(view.find('.result').text())
          .toMatch(/Correct!\s+Next Problem/);
      });

      it('can reject an incorrect answer', function() {
        view.find('.answer').val('false');
        view.find('.check-btn').click();
        expect(view.find('.result').text())
          .toEqual('Incorrect!');
      });
    });
  });
});
