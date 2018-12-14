$(document).ready(function() {
    var $portfolio = $('#portfolio');
    var $whole = $('html, body');
    var $anchor = $('.fa-angle-down');
    
    var toggleScroll = false;
    
    //Smooth scroll anchor
    $anchor.click(function(){
        $whole.animate({
            scrollTop: $portfolio.offset().top
        }, 'slow');
        toggleScroll = true;
    });
});