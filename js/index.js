$(document).ready(function() {
    var $portfolio = $('#portfolio');
    var $profileWrap = $('#profileWrap');
    var $whole = $('html, body');
    var $innerGrid = $('.innerGrid');
    var $a = $('a');

    //Smooth scroll down animation
    $(window).on('mousewheel', function(event) {
        if ($(this).width() >= 1024) {
            if (event.originalEvent.wheelDelta >= 0) {
                $whole.stop().animate({
                    scrollTop: $profileWrap.offset().top
                }, 'slow');
            }
            else {
                $whole.stop().animate({
                    scrollTop: $portfolio.offset().top
                }, 'slow');
            }
        }
    });
    
    //Smooth scroll anchor
    $a.click(function(){
        $whole.animate({
            scrollTop: $portfolio.offset().top
        }, 'slow');
    });
    
    //Porfolio bounce animation
    $innerGrid.hover(function() {
        $(this).find('h1, p').css('display', 'block').addClass('animated bounceIn');
        $(this).find('.overlay').css('opacity', '.9');

        $(this).find('h1, p').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(this).removeClass('animated bounceIn');
        });
    }, function() {
        $(this).find('.overlay').css('opacity', '0');
        $(this).find('h1, p').css('display', 'none');
    });

});