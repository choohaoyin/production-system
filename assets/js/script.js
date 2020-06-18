//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches



$(function(){
    $("header").load("assets/html/header.html"); 
    $("footer").load("assets/html/footer.html"); 
});

$('.carousel').carousel({
    interval: false,
  });

$(".next").click(function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	next_fs = $(this).parent().next();
	
	//activate next step on progressbar using the index of next_fs
	$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	
	//show the next fieldset
	next_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
			next_fs.css({'left': left, 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
    });
    
});

$(".previous").click(function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
	
	//de-activate current step on progressbar
	$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
	
	//show the previous fieldset
	previous_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});


// Inference Engine
let rules = new Object();

$.getJSON("assets/json/rules.json", function(data) {
    rules = data;
    // console.log(rules);
});

let wm = {};
let firedRules = [];

// Define jQuery Function
$(document).ready(function(){
    $.fn.getForm = function(form){ 
        var data = $(form).serializeArray();
        $.each(data, function(index, value) {
            $.fn.addToWM(value.name,value.value);
        })
        console.log(wm)
    }

    $.fn.addToWM = function(name,value) {
        if(!isNaN(value) && typeof value !== 'boolean') {
            value = parseInt(value);
        }
        if(typeof wm[name] !== 'undefined') {
            if(typeof wm[name] !== 'boolean') {
                if(typeof wm[name] !== 'object') {
                    wm[name] = [wm[name]];
                }
                wm[name].push(value);
            } else {
                wm[name] = value;
            }
        } else {
            wm[name] = value;
        }
    }

    $.fn.forwardChaining = function() {
        $.fn.getForm("#msform");
        let currentRule = Object.assign([], rules);
        // test = currentRule.splice(1,1);
        console.log(test);
        console.log('[here]',currentRule,currentRule.length);
        console.log('[rule]',rules);
        // for (rule of rules) {
        //     var pass = true;
        //     if ((rule.when.length > 1 ) &&  typeof rule.when == 'object') {
        //         for (i = 0; i < rule.when.length; i++) {
        //             const condition = wm[rule.when[i]] + rule.is[i];
        //             if (!eval(condition)) pass = false;
        //         }
        //     }
        //     else {
        //         const condition = wm[rule.when] + rule.is;
        //         if (!eval(condition)) pass = false;
        //     }
        //     if (pass) $.fn.addToWM(rule.put,rule.as);
        // }
        for (i=0; i<currentRule.length;i++) {
            var pass = false;
            if ((currentRule[i].when.length > 1 ) &&  typeof currentRule[i].when == 'object') {
                var multiPass = true;
                for (j = 0; j < currentRule[i].when.length; j++) {
                    const condition = wm[currentRule[i].when[j]] + currentRule[i].is[j];           
                    console.log("[condition]",condition);
                    console.log("[result]",eval(condition));
                    if (!eval(condition)) {
                        console.log("here");
                        multiPass = false;
                        break;
                    }
                }
                console.log(multiPass);
                pass = multiPass;
            }
            else {
                const condition = wm[currentRule[i].when] + currentRule[i].is;
                pass = eval(condition);
            }
            if (pass) {
                $.fn.addToWM(currentRule[i].put,currentRule[i].as);
                var removed = currentRule.splice(i,1);
                firedRules.push(...removed);
                i = 0;
            };
        }
        console.log(firedRules);
        console.log(wm);
    }
    
});


// dev function
$("#test_jquery").click(function(){
    wm = {} //testing
    firedRules = []
    $.fn.forwardChaining();
    var recommendation = [];
    console.log(recommendation)
    console.log("[wm re]",wm.recommendation)
    if (wm.recommendation !== undefined) {
        console.log("here");
        recommendation = wm.recommendation;
        console.log(recommendation);
    }
    var htmlCode = "";
    console.log("[re]",recommendation)
    if (recommendation.length > 0) {
        $.each(recommendation, function(index, value) {
            console.log(value);
            title = value
            des = title
            price = 0
            htmlCode += '<div style="border: black solid 1px; margin: 10px; padding: 5px;">'+'<h1>'+title+'</h1>'+'<h2>'+
                des+'</h2>'+'<h3>'+price+'</h3>'+'</div>';
        })
    }
    $("#result").html(htmlCode);
    whyString = ""
    for(firedRule of firedRules) {
        whyString += firedRule.description + "<br>";
    }
    $("#why").html(whyString);
});


$(".submit").click(function(){
    wm = {} // testing
    $.fn.getForm("#msform");
});

$("#bktest").click(function() {
    console.log("run");
    var data = $.fn.getForm("#bkform");
    for (rule of rules) {
        
    }
});