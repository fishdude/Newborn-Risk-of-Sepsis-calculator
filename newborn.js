Stats= new Meteor.Collection("stats");
Hits = new Meteor.Collection("hits");
Posts = new Meteor.Collection("posts");


// Rupture of membrain component
function ruptureOfMembrain(rom) {
    var calculatedRom = Math.pow(parseInt(rom, 10) + 0.05, 0.2) * 1.2256;
    return calculatedRom;
}
// gestational age in weeks
function gestationalAge(weeks, days) {
    var ageInWeeks = parseInt(weeks, 10) + parseInt(days, 10) / 7;
    return ageInWeeks;
}
// temp component with unit conversion
function temperature(unit, temp) {
    var calculatedTemp;

    if (unit == 'f') {
        calculatedTemp = temp * 0.868;
    } else if (unit == 'c') {
        var tempToF = ((temp * 1.8) + 32);
        calculatedTemp = tempToF * 0.868;
    }
    return calculatedTemp;
}

// gbs status
function calculateGbs(gbs) {
    var gbsComponent;

    if (gbs == "negative") {
        gbsComponent = 0;
    } else if (gbs == "positive") {
        gbsComponent = 0.5771;
    } else if (gbs == "unknown") {
        gbsComponent = 0.0427;
    }
    return gbsComponent;
}

// Antibiotic type and timing
function calculateAbx(abx) {
    var abxComponent;

    if (abx == "GBS Specific given prior to birth") {
        abxComponent = -1.0488;
    } else if (abx == "Broad spectrum => 4 hrs prior to birth") {
        abxComponent = -1.1861;
    } else if (abx == "Broad spectrum < 4 hrs prior to birth") {
        abxComponent = -1.0488;
    } else if (abx == "none") {
        abxComponent = 0;
    }
    return abxComponent;
}
// gestational age component with coefficent
function gestationalAgeComponent(weeks, days) {
    var age = gestationalAge(weeks, days);
    var calculatedGestAge = Math.pow(age, 2) * 0.0877;
    return calculatedGestAge;
}

// call all function components and sum for probability 
function eosProbability(weeks, days, unit, temp, rom, gbs, abx) {
    var ageWithCoefficient = gestationalAge(weeks, days) * -6.93250,
        ageComponent = gestationalAgeComponent(weeks, days),
        tempComponent = temperature(unit, temp),
        romComponent = ruptureOfMembrain(rom),
        gbsComponent = calculateGbs(gbs),
        abxComponent = calculateAbx(abx),
        sepCoefficient = 40.712;
    //sum 
    var sum = (ageWithCoefficient + tempComponent + romComponent + gbsComponent + abxComponent + ageComponent + sepCoefficient);
    var probability = (1 / (1 + Math.exp(-sum)) * 1000);
    return probability;
}



if(Meteor.isClient) {
    
    //routing
    Router.map(function(){
        this.route('home', {path:'/'});
        this.route('calculator', {path:'/calculator'});
        this.route('stats', {path:'/stats'});
        this.route('forum', {path:'/forum'});
        this.route('compatibility', {path:'/compatibility'});
        this.route('clinicalguidelines', {path:'/guidelines'});
    });

    // Calculation statistic chartjs object
    Template.canvas.rendered = function () {
        var count = [20,20,50,20,20,40,20,15,20,10,15,18]

        var lineChartData = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","aug","sep","oct","nov","dec"],
            datasets: [{
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                data: count
                //[20, 20, 20, 20, 20, 20, 30, 0, 0, 0, 0, 0]
                //data: []
            
            }]

        };

    var myLine = new Chart(document.getElementById("canvas").getContext("2d")).Line(lineChartData);

    }

    //Temp unit field 'onchange' handler
    Template.form.events({
        'change .unit_radio': function(e) {
            $('input[type=radio][name=unit]').on('click change', function(){
                e.preventDefault();
                if($(this).val() == "f"){
                    $("#temp_input_c").hide();
                    $("#temp_input_f").fadeIn("slow");
                    $("#tempuratureF").prop("disabled", false);
                    $("#tempuratureC").prop("disabled", true);

                }else if($(this).val()== "c"){
                    $("#temp_input_f").hide();
                    $("#temp_input_c").fadeIn("slow");
                    $("#tempuratureF").prop("disabled", true);
                    $("#tempuratureC").prop("disabled", false);
                }
            });     
        },

        'change #days': function(e){
            e.preventDefault();
            $('input[type=number][name=days]').focusout(function(){
                if ($(this).val() < 0 || $(this).val() > 6 || $(this).val() == "") {
                    $("#errorDays").fadeIn("fast");
                    $("#validDays").hide();
                    $('#submit').prop("disabled", true);
                }else{
                    $("#errorDays").hide();
                    $("#validDays").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }

            });
        },

        'change #tempuratureF': function(e){
            e.preventDefault();
            $('input[type=number][name=tempuratureF]').focusout(function(){
                if ($(this).val() < 96 || $(this).val() > 104 || $(this).val() == "") {
                    $("#errorF").fadeIn("fast");
                    $("#validF").hide();
                    $('#submit').prop("disabled", true);
                }else{
                    $("#errorF").hide();
                    $("#validF").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }

            });
        },
        'change #tempuratureC': function(e){
            e.preventDefault();
            $('input[type=number][name=tempuratureC]').focusout(function(){
                if ($(this).val() < 35 || $(this).val() > 40 || $(this).val() == "") {
                    $("#errorC").fadeIn("fast");
                    $("#validC").hide();
                    $('#submit').prop("disabled", true);
                }else{
                    $("#errorC").hide();
                    $("#validC").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }

            });
        },
        'change #rom': function(e){
            e.preventDefault();
            $('input[type=number][name=rom]').focusout(function(){
                if ($(this).val() < 0 || $(this).val() > 240 || $(this).val() == "") {
                    $("#errorRom").fadeIn("fast");
                    $("#validRom").hide();
                    $('#submit').prop("disabled", true);
                }else{
                    $("#errorRom").hide();
                    $("#validRom").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }

            });
        },
        'change #weeks': function(e){
            e.preventDefault();
            $('input[type=number][name=weeks]').focusout(function(){
                if ($(this).val() < 34 || $(this).val() > 43 || $(this).val() == "") {
                    $("#errorWeeks").fadeIn("fast");
                    $("#validWeeks").hide();
                    $('#submit').prop("disabled", true);
                }else{
                    $("#errorWeeks").hide();
                    $("#validWeeks").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }

            });
        }




    });

    
    // form submit handler with mongoDB calculation data insert
    Template.form.events({
        "click #submit": function (event) {
            var form_data = $('#form_data').submit(function () {
                var form_object = ($(form_data).serializeArray());
                var result = eosProbability(
                form_object[0].value,
                form_object[1].value,
                form_object[2].value,
                form_object[3].value,
                form_object[4].value,
                form_object[5].value,
                form_object[6].value);
                var round_result = Math.round(result * 100) / 100;
                var date = new Date();
                var month = date.getMonth()+1;
                console.log(month);


                Stats.insert({
                    weeks: form_object[0].value,
                    days: form_object[1].value,
                    tempUnit: form_object[2].value,
                    temp: form_object[3].value,
                    rom: form_object[4].value,
                    gbs: form_object[5].value,
                    abx: form_object[6].value,
                    probability: round_result,
                    timeStamp: date
                });

                $("#results_round").html(round_result).fadeIn('fast');
                $('#submit').hide();
                $('#results').slideDown();
                //scroll to results div on mobile browsers
                $('html, body').animate({
                    scrollTop: $("#results").offset().top
                }, 2000);
                return false;
            });
           
        }
    });
    // result of calculation revealed to DOM
    Template.results.events({
       "click #reset": function(event) {
           $('#results').hide();
           $("#form_data")[0].reset();
           $(".tempI").hide();
           $('#submit').show();
            $('#validWeeks').hide();
           $('#validDays').hide();
           $('#validF').hide();
           $('#validC').hide();
           $('#validRom').hide();
       }   
    });

    Template.statsList.stats = function(){
        return Stats.find({});
    };
}

if (Meteor.isServer) {
    /*
  Meteor.startup(function () {
    if (Hits.find().count() === 0) {
      var months = ["1",
                   "2",
                   "3",
                   "4",
                   "5",
                   "6",
                   "7",
                   "8",
                   "9",
                   "10",
                   "11",
                   "12"];
      for (var i = 0; i < months.length; i++)
        Hits.insert({month: months[i], count: Math.floor(Random.fraction()*10)*5});
    }
  });
    */
}