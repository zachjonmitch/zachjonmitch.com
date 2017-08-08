$(document).ready(function() {
    var $portfolio = $('#portfolio');
    var $whole = $('html, body');
    var $a = $('a');
    
    var toggleScroll = false;
    
    //Smooth scroll anchor
    $a.click(function(){
        $whole.animate({
            scrollTop: $portfolio.offset().top
        }, 'slow');
        toggleScroll = true;
    });
});