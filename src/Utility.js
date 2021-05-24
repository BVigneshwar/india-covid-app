import states from './States.js';

/* Date formating to YYYY-MM-DD */
function dateFormat(date){
	var year = date.getFullYear();
	var month = ''+(date.getMonth()+1);
	var date = ''+date.getDate();
    if (month.length < 2) 
        month = '0' + month;
    if (date.length < 2) 
        date = '0' + date;

    return year+"-"+month+"-"+date;
}

/* To get daily count from cumulative count properties */
function getDailyCount({ state_code, date, prop, district, latest}){
	var result = 0;
	let today = dateFormat(new Date());
	latest = !!(latest && today == date);
	if(states[state_code]){
		var data = states[state_code];
		if(district){
			data = data.districts[district];
		}
		var state_data = data;
		data = data[prop];
		if(typeof(data[date]) == "undefined"){
			return;
		}
		do{
			var prev_date = new Date(date);
			prev_date.setDate(prev_date.getDate() - 1);
			var prev = dateFormat(prev_date);
			if(typeof(data[prev]) != "undefined" && typeof(data[date]) != "undefined"){
				result = data[prev] ? data[date] - data[prev] : data[date];
			}
			if(result == 0 && typeof(data[prev]) != "undefined" && latest){
				if(state_data.confirmed[prev] != state_data.confirmed[date]){
					
				}else if(state_data.recovered[prev] != state_data.recovered[date]){
					
				}else if(state_data.deceased[prev] != state_data.deceased[date]){
					
				}else{
					state_data.latest = prev;
				}
			}
			date = prev;
		}while(result == 0 && typeof(data[prev]) != "undefined" && latest);
		
	}
	return result;
}

/* To get daily count for a particular time period from cumulative count properties */
function getDailyCountFor({state_code, prop, district, days}) {
	let data = states[state_code];
	if(district){
		data = data.districts[district];
	}
	let label = [], ds = [];
	let count = getDailyCount({state_code : state_code, district : district, date : data.latest, prop : prop, latest : true});
	let date = data.latest;
	if(typeof(count) != "undefined") {
		ds.push(count);
		label.push(date);
	}
	
	if(days > 0) {
		while(--days > 0) {
			let prev_date = new Date(date);
			prev_date.setDate(prev_date.getDate() - 1);
			let prev = dateFormat(prev_date);
			count = getDailyCount({state_code : state_code, district : district, date : prev, prop : prop});
			if(typeof(count) == "undefined"){
				break;
			}
			ds.push(count);
			label.push(prev);
			date = prev;
		}
	}else{
		while(true) {
			let prev_date = new Date(date);
			prev_date.setDate(prev_date.getDate() - 1);
			let prev = dateFormat(prev_date);
			count = getDailyCount({state_code : state_code, district : district, date : prev, prop : prop});
			if(typeof(count) == "undefined") {
				break;
			}
			ds.push(count);
			label.push(prev);
			date = prev;
		}
	}
	return {label : label.reverse(), data : ds.reverse()};
}

function numberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ColorScale(){
	this.max = {
		confirmed : 40000,
		recovered : 40000,
		deceased : 1000
		
	};
	
	this.color_range = {
		confirmed : [ '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c' ],
		recovered : [ '#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20' ],
		deceased : [ '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#e53935', '#d32f2f', '#c62828', '#b71c1c' ]
	};
	
	this.scale = function(prop, value){
		if(value >= this.max[prop]){
			return this.color_range[prop][9];
		}
		return this.color_range[prop][Math.round((value * 9)/this.max[prop])];
	}
}

export {dateFormat, getDailyCount, getDailyCountFor, numberWithCommas, ColorScale};