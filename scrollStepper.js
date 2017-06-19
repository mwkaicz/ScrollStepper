/***************************************************************************************************************************************************************
* 
* This file is a part of mwkaicz/scrollStepper
* 
* The MIT License
*
* Copyright 2017 mwkaicz
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
***************************************************************************************************************************************************************/

var ScrollStepper = (
    function(){
        var scope = null;
        var ScrollStepper = function(slides, delay){
            this.keys = {37: false, 38: true, 39: false,40: true,33: true,34: true,35: true,36: true}; //left, up, right, down, pageup, pagedown, end, home 
            this.slides = slides;
            this.scrollClick = false;
            this.touchStart = 0;
            this.lockTimeout = 0;
            this.timer = 0;
            this.timeout = 0;
            this.changeTimeout = 0;
            this.delay = delay | 500;
            this.prevSlideObj = null; 
            this.pa = 0;
            this.pp = 0;
            this.index = -1;
            this.newIndex = 0;
            
            if (typeof this._slides['0'] !== 'undefined'){
                this._slides['-' + window.innerHeight] = this._slides['0']; //mobile overscroll
                delete this._slides['0'];
            }

            body = document.getElementsByTagName('BODY')[0];
            body.addEventListener('touchstart', this.touchstart, false);
            window.addEventListener('mousedown', this.clickStart, false);
            document.onkeyup = this.processKey;

            scope = this;
            this.toggleScroll(true);
        };

        Object.defineProperty(ScrollStepper.prototype, "slides", {
            get: function () { return this._slides; },
            set: function (slides) { this._slides = slides; this._slidesKeys = Object.keys(this._slides); },
            enumerable: true,
            configurable: true
        });

        ScrollStepper.prototype.lockScroll = function(){
            if (scope.lockTimeout === 0){ //zabranuje nekonecnemu zamykani
                scope.toggleScroll(false);
                scope.lockTimeout = setTimeout(function(){
                    scope.toggleScroll(true);
                    scope.lockTimeout = 0;
                }, scope.delay); // doba zamknuti
            } 
        }

        ScrollStepper.prototype.toggleScroll = function(oEnable){
            if (!oEnable){
                if (window.addEventListener){ //stary FF
                    window.addEventListener('DOMMouseScroll', scope.preventMouse, false);
                }
                window.onwheel = scope.preventMouse;
                window.onmousewheel = document.onmousewheel = scope.preventMouse; //IE
                window.ontouchmove = scope.preventMouse;
                window.onmouseup = null;
                document.onkeydown = scope.preventKey;    
                body = document.getElementsByTagName('BODY')[0];
                body.removeEventListener('touchend', scope.touchend , false);
            }else{
                if (window.removeEventListener){
                    window.removeEventListener('DOMMouseScroll', scope.preventMouse, false);
                }
                window.onwheel = scope.processScroll;
                window.onmousewheel = document.onmousewheel = scope.processScroll;
                window.ontouchemove = scope.processScroll;
                window.onmouseup = scope.clickEnd;
                document.onkeydown = null;
                body = document.getElementsByTagName('BODY')[0];
                body.addEventListener('touchend', scope.touchend, false);
            }
        };

        ScrollStepper.prototype.preventMouse = function(e){
            e = e || window.event;
            if (e.preventDefault){
                e.preventDefault();
            }
            e.returnValue = false;
        };
    
        ScrollStepper.prototype.preventKey = function(e){
            if (scope.keys[e.keyCode]){
                e.preventDefault();
                return false;
            }
        };
            
        ScrollStepper.prototype.processScroll = function(e){
            scope.processMove(e);
        };
        
        ScrollStepper.prototype.processKey = function(e){
            if (scope.keys[e.keyCode]){
                switch (e.keyCode){
                case 38:
                case 33:
                case 36:
                    scope.processMove(e, null, -1);
                    break;
                default:
                    scope.processMove(e, null, 1);     
                }
            }
        };

        ScrollStepper.prototype.clickStart = function(e){
            const scroll_bar_width = 17;
            scope.scrollClick = e.clientX > window.innerWidth - scroll_bar_width;
        };

        ScrollStepper.prototype.clickEnd = function(e){
            if (scope.scrollClick){
                scope.processMove(e);
            }
        };

        ScrollStepper.prototype.touchstart = function(e){
            var touchobj = e.changedTouches[0]; 
            touchStart = touchobj.clientY;
        };

        ScrollStepper.prototype.touchend = function(e){
            var touchobj = e.changedTouches[0]; 
            var newpos = touchobj.clientY;
            if (newpos !== touchStart){
                scope.processMove(e, touchStart - newpos);
            }
        };

        ScrollStepper.prototype.processMove = function(e, m, dir){
            var oIndex = false;
            scope.pp = scope.pa;
            if (typeof m !== 'undefined' && m !== null) { 
                scope.pa = window.pageYOffset + m;
                window.scrollTo(window.pageXOffset, scope.pa);
                dir = scope.pa - scope.pp;
            }else{
                if (typeof dir !== 'undefined'){
                    if ( 
                        (dir > 0 && scope.index < scope._slidesKeys.length - 1) 
                        || (dir < 0 && scope.index > 0) )
                    {
                        scope.newIndex += dir;
                        oIndex = true;
                    }
                }else{
                    scope.pa = window.pageYOffset;
                    dir = scope.pa - scope.pp;
                }
            }
            
            if (!oIndex){
                if ( 
                    (dir > 0 && scope.index < scope._slidesKeys.length - 1) 
                    || (dir < 0 && scope.index > 0) )
                { 
                    
                    var nIndex = -1;
                    for (var i = 0; i < scope._slidesKeys.length; i++){
                        if (scope._slidesKeys[i] <= scope.pa){
                            if (i < scope._slidesKeys.length - 1){
                                if (scope._slidesKeys[i+1] > scope.pa){
                                    nIndex = i;
                                    break;
                                }
                            }else{
                                nIndex = i;
                            }
                        }
                    }
                    scope.newIndex = nIndex;
                    

                }
            }
            scope.processChange();

        };

        ScrollStepper.prototype.processChange = function(){
            var now = new Date();
            var dif = now.getTime() - scope.timer;
            if (scope.delay < dif && scope.timeout === 0){
                scope.timeout = setTimeout(scope.processChange, scope.delay - dif );
                return;
            }
            if (scope.index === scope.newIndex){
                return;
            }
            scope.timeout = 0;
            scope.timer = now;
            var dir = scope.newIndex > scope.index ? 1 : -1;

            var obj = scope._slides[scope._slidesKeys[scope.index + dir]];
            scope.setActive(obj);
            if (scope.index >= 0){
                var prevObj = scope._slides[scope._slidesKeys[scope.index]];
                scope.setInactive(prevObj);
            }

            if (scope.newIndex !== scope.index + dir ){
                scope.lockScroll();
                setTimeout(scope.processChange, scope.delay);
            }
            scope.index += dir;
        };

        ScrollStepper.prototype.setActive = function(obj){
            for (var k in obj){
                var els = [];
                if (k.substr(0,1) === '.' ){
                    els = document.getElementsByClassName(k.substr(1));
                }else if(k.substr(0,1) === '#'){
                    els = [document.getElementById(k.substr(1))];
                }else{
                    els = document.getElementsByTagName(k);
                }
                for ( var i = 0; i < els.length; i ++){
                    var el = els[i];
                    if (el !== null){
                        for (var l in obj[k]['active']){
                            el.setAttribute(l, obj[k]['active'][l]);
                        }
                    }
                }
            }
        }

        ScrollStepper.prototype.setInactive = function(obj){
            for (var k in obj){
                var els = [];
                if (k.substr(0,1) === '.' ){
                    els = document.getElementsByClassName(k.substr(1));
                }else if(k.substr(0,1) === '#'){
                    els = [document.getElementById(k.substr(1))];
                }else{
                    els = document.getElementsByTagName(k);
                }
                for ( var i = 0; i < els.length; i ++){
                    var el = els[i];
                    if (el !== null){
                        for (var l in obj[k]['inactive']){
                            el.setAttribute(l, obj[k]['inactive'][l]);
                        }
                    }
                }   
            }
        }

        return ScrollStepper;
    }
());