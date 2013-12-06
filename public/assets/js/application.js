var showDoughnutChart = function(element){
    var $element = $(element);
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
};

var graphInitDelay = 100;

$(window).load(function() {
    $(".doughnutChart").on("inview", function() {
        var $this = $(this);
        $this.removeClass("hidden").off("inview");
        setTimeout(showDoughnutChart(this), graphInitDelay);
        console.log();
    });
});