//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var current_fs_index = 1;

$("img").attr("draggable",false);

$(function(){
    $("header").load("assets/html/header.html"); 
    $("footer").load("assets/html/footer.html"); 
});

$(window).resize(function() {
    $(".form-container").height($('#msform > fieldset').eq(current_fs_index-1).height());
  });

$('.carousel').carousel({
    interval: false,
  });



// testing
let wm = {
    "budget": 1000,
    "interest": "technology"
}




$(".next").click(function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	next_fs = $(this).parent().next();
    current_fs_index = $(this).index();
    
	//activate next step on progressbar using the index of next_fs
	// $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	
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
    $(".form-container").height(next_fs.height());


    if ($(this).hasClass("submit")) {
        $.fn.forwardChaining();
        console.log(wm)

        test_item = {
            "technology": [
            { 
                "id": "T0001",
                "name": "Apple Watch Series 3",
                "price": "From RM849.00",
                "img": "images/recommendations/T0017.jpg", 
                "link": "https://www.apple.com/my/shop/buy-watch/apple-watch-series-3/38mm-gps-space-gray-aluminum-black-sport-band"
            },{ 
                "id": "T0002",
                "name": "Apple Watch Series 4",
                "price": "From RM849.00",
                "img": "images/recommendations/T0017.jpg", 
                "link": "https://www.apple.com/my/shop/buy-watch/apple-watch-series-3/38mm-gps-space-gray-aluminum-black-sport-band"
            }
        ]
        }

        // console.log(test_item.technology)

        // for(recommendation of wm["recommendation"]) {
        //     var test = test_item.filter(function (item) {
        //         return item.id == "T0001";
        //     })
        //     console.log(test);
        // }

        // "id": "TG0016",
        // "name": "Toy Story Whack an Alient",
        // "price": "RM129.99",
        // "img": "images/recommendations/TG0016.png", 
        // "link":





        var matched = []
        for(recommendation of wm["recommendation"]) {
            var test = items.filter(function (category) {
                var x = category.filter(function (item) {
                    return item.id == recommendation
                })
                if ((x.length != 0) && (typeof x !== "undefined")) {
                    matched.push(...x)
                }
            })
        }

        var itemList = "";
        console.log(matched);
        for(i = 0; i<matched.length;i++) {
            matched_item = matched[i];
            console.log(matched_item);
            if((i+1)%3 == 1) {
                if (i == 0) {
                    itemList += '<div class="carousel-item active"><div class="row btn-group btn-group-toggle" data-toggle="buttons"><div class="empty"></div>';

                } else {
                    itemList += '<div class="carousel-item"><div class="row btn-group btn-group-toggle" data-toggle="buttons"><div class="empty"></div>';
                }
            }

            itemList += '<div class="item-container">'+'<span id=\"'+matched_item.id+'\">'+
            '<label for=\"'+matched_item.id+'\" class=\"btn btn-secondary\">'+
            '<input type=\"checkbox\" name=\"recommendation\" id=\"'+matched_item.id+'\" value=\"'+matched_item.id+'\" title=\"'+matched_item.name+'\">' +
            '<img for=\"assets/'+matched_item.id+'\" class="img-fluid" src=\"assets/'+matched_item.img+'\"/>'+'</label>'+'<p>'+matched_item.name+'</p>'+' </span>  </div>';
            

            


            if(((i+1)%3 == 0) || (i == matched.length)) {
                itemList += '<div class="empty"></div></div></div>'
            }


            console.log(itemList);
        }
        console.log(itemList);
        $("#recommendation").children(".carousel-inner").html(itemList);
    }
});


$("#recommendation .carousel-inner").on("click",".carousel-item .item-container label", function () {
    var id = $(this).attr("for");
    // var popup = $(".popup-overlay, .popup-content");
    
    var matched = null;
    var test = items.filter(function (category) {
        var x = category.filter(function (item) {
            return item.id == id
        })
        if ((x.length != 0) && (typeof x !== "undefined")) {
            matched = x[0];
        }
    })
    
    console.log(matched);

    $(".popup-overlay, .popup-content, .buy-button, .item-img, .item-name, .item-price").addClass("active");
    $(".popup-content").children(".item-img").attr("src","assets/"+matched.img);
    $(".popup-content").children(".item-name").html(matched.name);
    $(".popup-content").children(".item-price").html(matched.price);
    $(".popup-content").children(".buy-button").attr("onclick",'location.href=\"'+matched.link+'\"');

});

$("#why").click(function () {
    $(".popup-overlay, .popup-content, .why-title, .why").addClass("active");
})


//appends an "active" class to .popup and .popup-content when the "Open" button is clicked
// $(".open").on("click", function() {
//     $(".popup-overlay, .popup-content").addClass("active");
//   });
  
  //removes the "active" class to .popup and .popup-content when the "Close" button is clicked 
  $(".close, .popup-overlay").on("click", function() {
    $(".popup-overlay, .popup-content").removeClass("active");

    $(".popup-content").find("*").each(function () {
        $(this).removeClass("active");
    })
    
  });

$(".previous").click(function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
    current_fs_index = $(this).parent().index();
    
	//de-activate current step on progressbar
	// $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
	
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
    $(".form-container").height(previous_fs.height());
});



// Inference Engine
let rules = new Object();
let items = new Object();

$.getJSON("assets/json/rules.json", function(data) {
    console.log("rules loaded");
    rules = data;
});

$.getJSON("assets/json/items.json", function(data) {
    console.log("items loaded")
    items = data;
});

$("#magic").click(function() {
    console.log("magic");
    $(".catalog").html("");
    for(categories of items) {
        for(item of categories) {
            if (Math.random() > 0.5) {
                break; // testing purpose, avoid too many item to be preview
            }
            console.log(item);
            id = item["id"];
            name = item["name"];
            price = item["price"];
            img = "assets/" + item["img"];
            link = item["link"];
            var add = '<a href=\"'+link+'\"'+'<div style="border: black solid 1px; margin: 10px; padding: 5px; width: 250px; float: right;">'+'<img src=\"'+img+'\" style="height: 100px; width:auto;">'+'<h3>'+name+'</h3>'+'<h4>'+
            price+'</h4>'+'<h5>'+id+'</h5>'+'</div>'+'</a>';

            current = $(".catalog").html();
            current += add
            $(".catalog").html(current);
            
        }
    }
});


// let wm = {};
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
        // $.fn.getForm("#msform"); // TEMPORARY DISABLE
        let currentRule = Object.assign([], rules);
        // test = currentRule.splice(1,1);
        // console.log(test);
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




$("#bktest").click(function() {
    console.log("run");
    var data = $.fn.getForm("#bkform");
    for (rule of rules) {
        
    }
});