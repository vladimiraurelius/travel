document.addEventListener('DOMContentLoaded', () => {
burgerMenu();

slideShow('.slider', {
    // isAutoplay: true
});

showProfile();

});

// Slider carousel
var slideShow = (function () {
    return function (selector, config) {
        var
            _slider = document.querySelector(selector),
            _sliderContainer = _slider.querySelector('.slider__content'),
            _sliderItems = _slider.querySelectorAll('.slider__item'),
            _sliderControls = document.querySelectorAll('.slider__button'),
            _currentPosition = 0,
            _transformValue = 0,
            _transformStep = 100,
            _itemsArray = [],
            _timerId,            
            _indicatorIndex = 0,
            _indicatorIndexMax = _sliderItems.length - 1,
            _stepTouch = 50,

            _config = {
                isAutoplay: false,
                directionAutoplay: 'next',
                delayAutoplay: 5000,
                isPauseOnHover: true
            };

        
        for (var key in config) {
            if (key in _config) {
                _config[key] = config[key];
            }
        }
        
        for (var i = 0, length = _sliderItems.length; i < length; i++) {
            _itemsArray.push({ item: _sliderItems[i], position: i, transform: 0 });
        }

        _itemsArray[_indicatorIndex].item.classList.add('slider__item--active');

        function toggleHeigth(){
            _sliderContainer.style.height = '';
            const height = window.getComputedStyle(_sliderContainer).height;
            _sliderContainer.style.height = height;
        };
        

        var position = {
            getItemIndex: function (mode) {
                var index = 0;
                for (var i = 0, length = _itemsArray.length; i < length; i++) {
                    if ((_itemsArray[i].position < _itemsArray[index].position && mode === 'min')
                        || (_itemsArray[i].position > _itemsArray[index].position && mode === 'max')) {
                        index = i;
                    }
                }
                return index;
            },

            getItemPosition: function (mode) {
                return _itemsArray[position.getItemIndex(mode)].position;
            }
        };

        var _move = function (direction) {
            var nextItem = _indicatorIndex;
            if (direction === 'next') {
                _currentPosition++;
                if (_currentPosition > position.getItemPosition('max') - 1) {
                    nextItem = position.getItemIndex('min');
                    _itemsArray[nextItem].position = position.getItemPosition('max') + 1;
                    _itemsArray[nextItem].transform += _itemsArray.length * 100;                        
                    _itemsArray[nextItem].item.style.transform = 'translateX(' + _itemsArray[nextItem].transform + '%)';
                }
                _transformValue -= _transformStep;
                _indicatorIndex = _indicatorIndex + 1;
                if (_indicatorIndex > _indicatorIndexMax) {
                    _indicatorIndex = 0;
                }
            } else {
                _currentPosition--;
                if (_currentPosition < position.getItemPosition('min') + 1) {
                    nextItem = position.getItemIndex('max');
                    _itemsArray[nextItem].position = position.getItemPosition('min') - 1;
                    _itemsArray[nextItem].transform -= _itemsArray.length * 100;
                    _itemsArray[nextItem].item.style.transform = 'translateX(' + _itemsArray[nextItem].transform + '%)';
                }
                _transformValue += _transformStep;
                _indicatorIndex = _indicatorIndex - 1;
                if (_indicatorIndex < 0) {
                    _indicatorIndex = _indicatorIndexMax;
                }
            }
            toggleHeigth();
            _sliderItems.forEach(item => {
                item.classList.remove('slider__item--active');
            });
            _itemsArray[_indicatorIndex].item.classList.add('slider__item--active');
            _sliderContainer.style.transform = 'translateX(' + _transformValue + '%)';            
        };

        var _moveTo = function (index) {
            var i = 0, direction = (index > _indicatorIndex) ? 'next' : 'prev';
            while (index !== _indicatorIndex && i <= _indicatorIndexMax) {
                _move(direction);
                i++;
            }
        };

        var _startAutoplay = function () {
            if (!_config.isAutoplay) {
                return;
            }
            _stopAutoplay();
            _timerId = setInterval(function () {
                _move(_config.directionAutoplay);
            }, _config.delayAutoplay);
        };

        var _stopAutoplay = function () {
            clearInterval(_timerId);
        };        

        var _isTouchDevice = function () {
            return !!('ontouchstart' in window || navigator.maxTouchPoints);
        };

        var _setUpListeners = function () {
            var _startX = 0;
            if (_isTouchDevice()) {
                _slider.addEventListener('touchstart', function (e) {
                    _startX = e.changedTouches[0].clientX;
                    _startAutoplay();
                });
                _slider.addEventListener('touchend', function (e) {
                    var
                        _endX = e.changedTouches[0].clientX,
                        _deltaX = _endX - _startX;
                    if (_deltaX > _stepTouch) {
                        _move('prev');
                    } else if (_deltaX < -_stepTouch) {
                        _move('next');
                    }
                    _startAutoplay();
                });
            } else {
                for (var i = 0, length = _sliderControls.length; i < length; i++) {
                    _sliderControls[i].classList.add('slider__button_show');
                }
            }
            _slider.addEventListener('click', function (e) {
                if (e.target.classList.contains('slider__button')) {
                    e.preventDefault();
                    _move(e.target.classList.contains('slider__button_next') ? 'next' : 'prev');
                    _startAutoplay();
                } else if (e.target.getAttribute('data-slide-to')) {
                    e.preventDefault();
                    _moveTo(parseInt(e.target.getAttribute('data-slide-to')));
                    _startAutoplay();
                }
            });
            document.addEventListener('visibilitychange', function () {
                if (document.visibilityState === "hidden") {
                    _stopAutoplay();
                } else {
                    _startAutoplay();
                }
            }, false);
            if (_config.isPauseOnHover && _config.isAutoplay) {
                _slider.addEventListener('mouseenter', function () {
                    _stopAutoplay();
                });
                _slider.addEventListener('mouseleave', function () {
                    _startAutoplay();
                });
            }
        };

        
        _setUpListeners();
        _startAutoplay();

        return {
            next: function () {
                _move('next');
            },

            left: function () {
                _move('prev');
            },

            stop: function () {
                _config.isAutoplay = false;
                _stopAutoplay();
            },

            cycle: function () {
                _config.isAutoplay = true;
                _startAutoplay();
            }
        }
    }
}());

// Burger menu
function burgerMenu() {
    const burgerButton = document.querySelector('.button-burger');
    const burgerMenuModal = document.querySelector('.menu');
    const burgerMenuItem = document.querySelectorAll('.menu__item');

    function onBurgerMenu(){
        burgerButton.classList.toggle('button-burger--active');
        burgerMenuModal.classList.toggle('menu--open');
        document.body.classList.toggle('locked');
    }

    burgerButton.addEventListener('click', onBurgerMenu);

    burgerMenuItem.forEach(item => {
        item.addEventListener('click', onBurgerMenu);
    });
}

// Profile
function showProfile(){
    const profileButton = document.querySelector('.profile__button');
    const profile =  document.querySelector('.profile');

    profileButton.addEventListener('click', () => {
        profile.classList.toggle('profile--active');
    });
}



