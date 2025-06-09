var showDoughnutChart = function(element){
    var $element = jQuery(element);
    if(!$element.data('triggered')){
        var doughnutData = [{
                value: $element.data('level'),
                color:"#1abc9c"
            },
            {
                value : 100 - Number($element.data('level')),
                color : "#ecf0f1"
            }];
    
        var myDoughnut = new Chart(element.getContext("2d")).Doughnut(doughnutData, {
            percentageInnerCutout : 65,
            animationEasing : "easeInOutSine",
            animateRotate : true
        });
        $element.data('triggered', true)
    }
};

jQuery(window).load(function() {
    jQuery(".doughnutChart").on("inview", function() {
        showDoughnutChart(this);
    });

    jQuery("#myName").fitText(.8);
    jQuery("#myEmail").fitText(2.6);
});