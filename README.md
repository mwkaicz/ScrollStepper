# ScrollStepper
During scrolling prevents skipping over some important position on the page

Code example:
      window.scrollTo(window.pageXOffset, 0);
      
      var schema = {
        0: {'#test1': {active: {'class': 'active'}, inactive: {'class': ''}}},
        200: {'#test2': {active: {'class': 'active'}, inactive: {'class': ''}}},
        500: {'#test3': {active: {'class': 'active'}, inactive: {'class': ''}}},
        700: {'#test4': {active: {'class': 'active'}, inactive: {'class': ''}}},
        900: {'#test5': {active: {'class': 'active'}, inactive: {'class': ''}}},
        2000: {'#test6': {active: {'class': 'active'}, inactive: {'class': ''}}},
      };

      scrollStepper = new ScrollStepper(schema, 500);

      body = document.getElementsByTagName('BODY')[0];
      body.style.height = (window.innerHeight + 2000) + 'px';


Results example:
https://rawgit.com/mwkaicz/ScrollStepper/master/scrollSteps.html
