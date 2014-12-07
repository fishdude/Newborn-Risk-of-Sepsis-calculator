

Stats = new Meteor.Collection("stats");
Hits = new Meteor.Collection("hits");
Posts = new Meteor.Collection("posts");

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

function backToRisk(odds) {
    var recResult = odds / (1 + odds);
    return recResult;
}

function ClinicalRecommendation(risk) {
    var guidelines = [];
    perThousand = risk / 1000;
    odds = perThousand / (1 - perThousand);
    calc1 = risk;
    preRec1 = odds * .41;
    preRec2 = odds * 5.0;
    preRec3 = odds * 21.2;
    wellAppearing = backToRisk(preRec1) * 1000;
    equivocal = backToRisk(preRec2) * 1000;
    clinicalIllness = backToRisk(preRec3) * 1000;
    roundWellAppearing = Math.round(wellAppearing * 100) / 100;
    roundEquivocal = Math.round(equivocal * 100) / 100;
    roundClinicalIllness = Math.round(clinicalIllness * 100) / 100;

    recs = [roundWellAppearing, roundEquivocal];

    var recommendation;

    var recObject = [];

    //EOS risk @ Birth Clinical Guildlines conditions

    if (calc1 < 1) {
        recommendation = "<td>" + "No additional care" + "</td>";
        var obj = {
            risk: "<td>" + calc1 + "</td>",
            rec: recommendation
        };
        recObject.push(obj);
    }else if(calc1 >= 1){
        recommendation = "<td>" + "Vitals every 4 hours for 24 hours" + "</td>";
        var obj = {
            risk: "<td>" + calc1 + "</td>",
            rec: recommendation
        };
        recObject.push(obj);
    }

    // Well apprearing equivocal exam clinical guidelines conditions
    for (var i = 0; i < recs.length; i++) {
        if (recs[i] < 1) {
            recommendation = "<td>" + "No additional care" + "</td>";
        }
        if (recs[i] >= 1 && recs[i] < 3) {
            recommendation = "<td>" + "Blood culture and vitals every 4 hours for 24 hours" + "</td>";
        }
        if (recs[i] >= 3) {
            recommendation = "<td>" + "Start empiric antibiotics" + "</td>";
        }
        var obj = {
            risk: "<td>" + recs[i] + "</td>",
            rec: recommendation
        };
        recObject.push(obj);
    }

    if (roundClinicalIllness < 3) {
        recommendation = "<td>" + "Consider antibiotic treatment" + "</td>";
        var obj = {
            risk: "<td>" + roundClinicalIllness + "</td>",
            rec: recommendation
        };
        recObject.push(obj);
    }else if(roundClinicalIllness >= 3){
        recommendation = "<td>" + "Start empiric antibiotics" + "</td>";
        var obj = {
            risk: "<td>" + roundClinicalIllness + "</td>",
            rec: recommendation
        };
        recObject.push(obj);
    }


    return recObject;
}
function selectIncidence(incidence){
    var incidenceComponent;
    if (incidence == "0") {
        incidenceComponent = 40.0528;
    } else if (incidence == "1") {
        incidenceComponent = 40.3415;
    } else if (incidence == "2") {
        incidenceComponent = 40.5656;
    } else if (incidence == "3") {
        incidenceComponent = 40.7489;
    }

    return incidenceComponent;
}


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

function exCalculateGbs(gbs) {
    var gbsComponent;
    if (gbs == "0") {
        gbsComponent = 0;
    } else if (gbs == "1") {
        gbsComponent = 0.5771;
    } else if (gbs == "2") {
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

function exCalculateAbx(abx) {
    var abxComponent;
    if (abx == "0") {
        abxComponent = -1.0488;
    } else if (abx == "1") {
        abxComponent = -1.1861;
    } else if (abx == "2") {
        abxComponent = -1.0488;
    } else if (abx == "3") {
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

function eosProbability(incidence, weeks, days, unit, temp, rom, gbs, abx) {
    var ageWithCoefficient = gestationalAge(weeks, days) * -6.93250,
        ageComponent = gestationalAgeComponent(weeks, days),
        tempComponent = temperature(unit, temp),
        romComponent = ruptureOfMembrain(rom),
        gbsComponent = calculateGbs(gbs),
        abxComponent = calculateAbx(abx),
        sepCoefficient = selectIncidence(incidence);
    //sum 
    var sum = (ageWithCoefficient + tempComponent + romComponent + gbsComponent + abxComponent + ageComponent + sepCoefficient);
    var probability = (1 / (1 + Math.exp(-sum)) * 1000);
    return probability;
}

function exEosProbability(weeks, days, unit, temp, rom, gbs, abx) {
    var ageWithCoefficient = gestationalAge(weeks, days) * -6.93250,
        ageComponent = gestationalAgeComponent(weeks, days),
        tempComponent = temperature(unit, temp),
        romComponent = ruptureOfMembrain(rom),
        gbsComponent = exCalculateGbs(gbs),
        abxComponent = exCalculateAbx(abx),
        sepCoefficient = 40.712;
    //sum 
    var sum = (ageWithCoefficient + tempComponent + romComponent + gbsComponent + abxComponent + ageComponent + sepCoefficient);
    var probability = (1 / (1 + Math.exp(-sum)) * 1000);
    return probability;
}
if (Meteor.isClient) {
    //routing
    Router.map(function() {
        this.route('home', {
            path: '/'
        });
        this.route('calculator', {
            path: '/calculator'
        });
        /*this.route('excalc', {
            path: '/excalc'
        });*/
        this.route('stats', {
            path: '/stats'
        });
        this.route('forum', {
            path: '/forum'
        });
        this.route('compatibility', {
            path: '/compatibility'
        });
        this.route('clinicalguidelines', {
            path: '/guidelines'
        });
    });
    
    //Temp unit field 'onchange' handler
    Template.form.events({
        'change .unit_radio': function(e) {
            $('input[type=radio][name=unit]').on('click change', function() {
                e.preventDefault();
                if ($(this).val() == "f") {
                    $("#temp_input_c").hide();
                    $("#temp_input_f").fadeIn("slow");
                    $("#tempuratureF").prop("disabled", false);
                    $("#tempuratureC").prop("disabled", true);
                } else if ($(this).val() == "c") {
                    $("#temp_input_f").hide();
                    $("#temp_input_c").fadeIn("slow");
                    $("#tempuratureF").prop("disabled", true);
                    $("#tempuratureC").prop("disabled", false);
                }
            });
        },
        'change #days': function(e) {
            e.preventDefault();
            $('input[type=number][name=days]').focusout(function() {
                if ($(this).val() < 0 || $(this).val() > 6 || $(this).val() == "") {
                    $("#errorDays").fadeIn("fast");
                    $("#validDays").hide();
                    $('#submit').prop("disabled", true);
                } else {
                    $("#errorDays").hide();
                    $("#validDays").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }
            });
        },
        'change #tempuratureF': function(e) {
            e.preventDefault();
            $('input[type=number][name=tempuratureF]').focusout(function() {
                if ($(this).val() < 96 || $(this).val() > 104 || $(this).val() == "") {
                    $("#errorF").fadeIn("fast");
                    $("#validF").hide();
                    $('#submit').prop("disabled", true);
                } else {
                    $("#errorF").hide();
                    $("#validF").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }
            });
        },
        'change #tempuratureC': function(e) {
            e.preventDefault();
            $('input[type=number][name=tempuratureC]').focusout(function() {
                if ($(this).val() < 35 || $(this).val() > 40 || $(this).val() == "") {
                    $("#errorC").fadeIn("fast");
                    $("#validC").hide();
                    $('#submit').prop("disabled", true);
                } else {
                    $("#errorC").hide();
                    $("#validC").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }
            });
        },
        'change #rom': function(e) {
            e.preventDefault();
            $('input[type=number][name=rom]').focusout(function() {
                if ($(this).val() < 0 || $(this).val() > 240 || $(this).val() == "") {
                    $("#errorRom").fadeIn("fast");
                    $("#validRom").hide();
                    $('#submit').prop("disabled", true);
                } else {
                    $("#errorRom").hide();
                    $("#validRom").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }
            });
        },
        'change #weeks': function(e) {
            e.preventDefault();
            $('input[type=number][name=weeks]').focusout(function() {
                if ($(this).val() < 34 || $(this).val() > 43 || $(this).val() == "") {
                    $("#errorWeeks").fadeIn("fast");
                    $("#validWeeks").hide();
                    $('#submit').prop("disabled", true);
                } else {
                    $("#errorWeeks").hide();
                    $("#validWeeks").fadeIn("fast");
                    $('#submit').prop("disabled", false);
                }
            });
        }
    }); /*params calculater*/
    /*Template.excalc.rendered = function() {
        var weeks = getQueryVariable("weeks");
        var days = getQueryVariable("days");
        var units = getQueryVariable("units");
        var temp = getQueryVariable("temp");
        var rom = getQueryVariable("rom");
        var abx = getQueryVariable("abx");
        var timing = getQueryVariable("timing");
        console.log(weeks);
        console.log(days);
        console.log(units);
        console.log(temp);
        console.log(rom);
        console.log(abx);
        console.log(timing);
        var result = exEosProbability(weeks, days, units, temp, rom, abx, timing);
        var round_result = Math.round(result * 100) / 100;
        var final = ClinicalRecommendation(round_result);
        var header = '<td class="tableHeader"></td>' + '<td class="tableHeader">Risk per 1000 births</td>' + '<td class="tableHeader">Clinical Recommendation</td>';
        var rec1 = '<td class="greyrec">EOS risk @ birth</td>' + final[0].risk + final[0].rec;
        var rec2 = '<td class="greenrec">Well Appearing</td>' + final[1].risk + final[1].rec;
        var rec3 = '<td class="yellowrec">Equivocal Exam</td>' + final[2].risk + final[2].rec;
        var rec4 = '<td class="redrec">Clinical illness</td>' + final[3].risk + final[3].rec;
        document.getElementById("guidelinesTable").insertRow(-1).innerHTML = header;
        document.getElementById("guidelinesTable").insertRow(-1).innerHTML = rec1;
        document.getElementById("guidelinesTable").insertRow(-1).innerHTML = rec2;
        document.getElementById("guidelinesTable").insertRow(-1).innerHTML = rec3;
        document.getElementById("guidelinesTable").insertRow(-1).innerHTML = rec4;
        $("#exResults").html(round_result).fadeIn('fast');
        console.log(result);
        // write numbered if statement function for abx
        //write numbered if statement function for timing
    };*/
    // form submit handler with mongoDB calculation data insert
    Template.form.events({
        "click #submit": function(event) {
            event.preventDefault();
            var form_object = ($('#form_data').serializeArray());
            //eosProbability(incidence, weeks, days, unit, temp, rom, gbs, abx)
            var result = eosProbability(
            form_object[0].value, form_object[1].value, form_object[2].value, form_object[3].value, form_object[4].value, form_object[5].value, form_object[6].value, form_object[7].value);
            var round_result = Math.round(result * 100) / 100;
            var date = new Date();
            var month = date.getMonth() + 1;
            
            var final = ClinicalRecommendation(round_result);
            var header = '<td class="tableHeader"></td>' + '<td class="tableHeader">Risk per 1000 births</td>' + '<td class="tableHeader">Clinical Recommendation</td>';
            var rec1 = '<td class="greyrec">EOS risk @ birth</td>' + final[0].risk + final[0].rec;
            var rec2 = '<td class="greenrec">Well Appearing</td>' + final[1].risk + final[1].rec;
            var rec3 = '<td class="yellowrec">Equivocal Exam</td>' + final[2].risk + final[2].rec;
            var rec4 = '<td class="redrec">Clinical illness</td>' + final[3].risk + final[3].rec;
            document.getElementById("guidelinesTable").insertRow(-1).innerHTML = header;
            document.getElementById("guidelinesTable").insertRow(-1).innerHTML = rec1;
            document.getElementById("guidelinesTable").insertRow(-1).innerHTML = rec2;
            document.getElementById("guidelinesTable").insertRow(-1).innerHTML = rec3;
            document.getElementById("guidelinesTable").insertRow(-1).innerHTML = rec4;

        

            //$("#results_round").html(round_result).fadeIn('fast');
            $('#submit').hide();
            $('#results').slideDown();
            //scroll to results div on mobile browsers
            $('html, body').animate({
                scrollTop: $("#results").offset().top
            }, 2000);
            return false;
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
            $('#riskColorMeter').removeClass("lowRiskBar midRiskBar highRiskBar");
            $("#guidelinesTable tr").html("");
        }
    });
    Template.statsList.stats = function() {
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