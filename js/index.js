$(document).ready(function() {
    var $portfolio = $('#portfolio');
    var $profileWrap = $('#profileWrap');
    var $whole = $('html, body');
    var $innerGrid = $('.innerGrid');
    var $a = $('a');
    
    var toggleScroll = false;

    //Smooth scroll down animation
    $(window).on('mousewheel', function(event) {
        if ($(this).width() > 990) {
            if (event.originalEvent.wheelDelta >= 0 && toggleScroll === true) {
                $whole.stop().animate({
                    scrollTop: $profileWrap.offset().top
                }, 'slow');
                toggleScroll = false;
            }
    else if (event.originalEvent.wheelDelta <= 0 && toggleScroll === false) {
                $whole.stop().animate({
                    scrollTop: $portfolio.offset().top
                }, 'slow');
                toggleScroll = true;
            }
        }
    });
    
    //Smooth scroll anchor
    $a.click(function(){
        $whole.animate({
            scrollTop: $portfolio.offset().top
        }, 'slow');
        toggleScroll = true;
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