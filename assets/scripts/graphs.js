queue()
    .defer(d3.csv,"assets/data/crimedata.csv")
    .await(makeGraphs);

var colorCodesOffence=d3.scale.ordinal()
    .domain(["Sexual assault", "Assault", "Robbery", "Criminal harassment", "Uttering threats"])
    .range(["#7986CB", "#ed2939", "#fed700", "#0b6623", "#f99245"])
    
var colorCodesYear = d3.scale.ordinal()
    .domain(["2011", "2012"])
    .range(["#27AEE3", "#50C878"])
    
function makeGraphs(error, crimeData) {
    //create a cross filter
    var ndx=crossfilter(crimeData);
	 crimeData.forEach(function(d) {
        d.Total_sum = parseInt(d["count"]);
    });
    crimeData.forEach(function(d) {
        if (d.province === "NL") {
            d.province = "Newfoundland and Labrador"
        }else if (d.province === "PE") {
            d.province = "Prince Edward Island"
        }else if (d.province === "NS") {
            d.province = "Nova Scotia"
        }else if (d.province === "NB") {
            d.province = "New Brunswick"
        }else if (d.province === "QC") {
            d.province = "Quebec"
        } else if (d.province === "ON") {
            d.province = "Ontario"
        } else if (d.province === "MB") {
            d.province = "Manitoba"
        }else if (d.province === "SK") {
            d.province = "Saskatchewan"
        }
         else if (d.province === "AB") {
            d.province = "Alberta"
        }
         else if (d.province === "BC") {
            d.province = "British Columbia"
        }
    })
    show_total_reported(ndx);
    show_year_selector(ndx);
    show_total_crimes_commited(ndx);
    show_crimes_reported_each_year(ndx);
    show_total_crime_each_province(ndx);
    show_offence_per_year(ndx);
    dc.renderAll();
}

/*------------------------------Number Display--*/
function show_total_reported(ndx) {
    var totalCrimes = ndx.groupAll().reduceSum(function(d) {
        return d["Total_sum"];
    });
    dc.numberDisplay("#total-count")
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d) {
            return d;
        })
        .group(totalCrimes)
        .formatNumber(d3.format(",.0f"));
}

/*------------------------------Year selector--*/
function show_year_selector(ndx){
    yearDim = ndx.dimension(dc.pluck("year"));
    yearGroup = yearDim.group();
    
    var year = dc.selectMenu("#year-selector")
    year.dimension(yearDim)
        .group(yearGroup)
        .title(function(d) {
            return d.key;
        })
}

/*------------------------------Row Chart #number-of-crime-row-chart--*/
function show_total_crimes_commited(ndx){
    var violation_dim=ndx.dimension(dc.pluck("violation"));
    var count_group= violation_dim.group().reduceSum(dc.pluck("Total_sum"));
    dc.rowChart("#number-of-crime-row-chart")
      .dimension(violation_dim)
      .group(count_group)
      .width(520)
      .height(400)
      .title(function(d) { return (d.key + " : " + d.value + ""); })
      .transitionDuration(300)
      .elasticX(true)
      .cap(5)
      .gap(2)
      .othersGrouper(false);
}

function show_crimes_reported_each_year(ndx){
    var crimeDim = ndx.dimension(dc.pluck("year"));
    var crimeGroup = crimeDim.group().reduceSum(dc.pluck("Total_sum"));
    dc.barChart("#crimes-reported-each-year")
        .width(400)
        .height(390)
        .margins({top: 5, right: 50, bottom: 30, left: 50})
        .dimension(crimeDim)
        .group(crimeGroup)
        .barPadding(.3)
        .colors(colorCodesYear)
        .colorAccessor(function(d) {
            return d.key
        })
        .transitionDuration(500)//animates when we filter
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .yAxisLabel("Number of Crimes")
        .xAxisLabel("Year")
        .yAxis().ticks(4);

}
function show_total_crime_each_province(ndx){

    var provinceDim=ndx.dimension(dc.pluck('province'));
    var provinceGroup= provinceDim.group().reduceSum(dc.pluck('Total_sum'));
    
    dc.pieChart("#total_crime_each_province")
   
        .dimension(provinceDim)
        .group(provinceGroup)
        .radius(200)
        .innerRadius(25)
        .legend(dc.legend().x(5).y(10).itemHeight(25).gap(1))
        .label(function(d) {
            return d.value;
        })
        .width(570)
        .height(285)
        .transitionDuration(500);
}

function show_offence_per_year(ndx) {
    var name_dim = ndx.dimension(dc.pluck('year'));
    var sexual_assault = name_dim.group().reduceSum(function(d) {
        if (d.violation === 'Sexual assault') {
            return +d.count;
        }
        else {
            return 0;
        }
    });

    
    var assault = name_dim.group().reduceSum(function(d) {
        if (d.violation === 'Assault') {
            return +d.count;
        }
        else {
            return 0;
        }
    });
	 var robbery = name_dim.group().reduceSum(function(d) {
        if (d.violation === 'Robbery') {
            return +d.count;
        }
        else {
            return 0;
        }
    });
  var criminal_harassment = name_dim.group().reduceSum(function(d) {
        if (d.violation === 'Criminal harassment') {
            return +d.count;
        }
        else {
            return 0;
        }
    });
	 var uttering_threats = name_dim.group().reduceSum(function(d) {
        if (d.violation === 'Uttering threats'){
			return +d.count;
        }
        else {
            return 0;
        }
    });
	
    var stackedChart = dc.barChart("#offence-per-year");
    stackedChart
         .width(320)
        .height(400)
        .dimension(name_dim)
        .group(sexual_assault, "Sexual assault")
        .stack(assault, "Assault")
		.stack(robbery ,"Robbery")
		.stack(criminal_harassment, "Criminal harassment")
		.stack(uttering_threats, "Uttering threats")
        .x(d3.scale.ordinal())
          .barPadding(.1)
        .xUnits(dc.units.ordinal)
        .colors(d3.scale.ordinal().range(['#009fab', '#8090c2','#727272','#38cdf1','#074d5e']))
         .yAxisLabel("Number of crimes recorded")
		 .margins({top: 20, left: 20, bottom: 50, right: 10})
        .legend(dc.legend().x(420).y(170).itemHeight(15).gap(5))
    
}