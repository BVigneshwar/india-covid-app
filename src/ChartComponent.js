import React from 'react';
import { Line } from 'react-chartjs-2';

import states from './States.js';
import ThemeContext from './ThemeContext.js';
import {getDailyCountFor} from './Utility.js';


const light_chart_options = {
	scales: {
		xAxes : {
			ticks : {
				color : '#666'
			},
			grid : {
				display : false,
				borderColor : 'rgba(0,0,0,0.1)'
			}
        },
        yAxes : {
            ticks : {
				color : '#666'
			},
			grid : {
				display : false,
				borderColor : 'rgba(0,0,0,0.1)'
			},
			beginAtZero : true
        }
	},
	plugins : {
		legend : {
			labels: {
				color: '#666'
			}
		}
	}
}

const dark_chart_options = {
	scales: {
		xAxes : {
			ticks : {
				color : 'rgba(255, 255, 255, 0.6)'
			},
			grid : {
				display : false,
				borderColor : 'rgba(255, 255, 255, 0.38)'
			},
        },
        yAxes : {
            ticks : {
				color : 'rgba(255, 255, 255, 0.6)'
			},
			grid : {
				display : false,
				borderColor : 'rgba(255, 255, 255, 0.38)'
			},
			beginAtZero : true
        }
	},
	plugins : {
		legend : {
			labels: {
				color: 'rgba(255, 255, 255, 0.6)'
			}
		}
	}
}

class ChartComponent extends React.Component {
	static contextType = ThemeContext;
	
	constructor(props) {
		super(props);
		this.state = {
			day_select : "7",
			state_select : "TT"
		};
		this.handleChange = this.handleChange.bind(this);
	}
	
	handleChange(event) {
		if(event.target.name == "days_select"){
			this.setState({day_select : event.target.value});
		}else{
			this.setState({state_select : event.target.value});
		}
		
	}
	
	render() {
		let state_options = Object.entries(states).map(data => <option key={data[0]} value={data[0]}>{data[1].name}</option>);
		let days = parseInt(this.state.day_select);
		let state_code = this.state.state_select;
		
		let chart_options = {};
		if(this.context == "dark_mode"){
			Object.assign(chart_options, dark_chart_options);
		}else{
			Object.assign(chart_options, light_chart_options);
		}
		
		var {label, data} = getDailyCountFor({state_code : state_code, prop : "confirmed", days : days});
		const confirmed_data = {
			labels: label,
			datasets: [
				{
					label: 'Confirmed',
					data: data,
					fill: true,
					backgroundColor: '#e1bee7',
					borderColor: '#8e24aa',
				},
			],
		};
		
		var {label, data} = getDailyCountFor({state_code : state_code, prop : "recovered", days : days});
		const recovered_data = {
			labels: label,
			datasets: [
				{
					label: 'Recovered',
					data: data,
					fill: true,
					backgroundColor: '#c8e6c9',
					borderColor: '#43a047',
				},
			],
		};
		
		var {label, data} = getDailyCountFor({state_code : state_code, prop : "deceased", days : days});
		const deceased_data = {
			labels: label,
			datasets: [
				{
					label: 'Deceased',
					data: data,
					fill: true,
					backgroundColor: '#ffccbc',
					borderColor: '#f4511e',
				},
			],
		};
		
		return (
			<div id="area_chart_container">
				<select name="days_select" value={this.state.day_select} onChange={this.handleChange}>
					<option value="7">Last 7 days</option>
					<option value="30">Last 30 days</option>
					<option value="90">Last 90 days</option>
					<option value="180">Last 180 days</option>
					<option value="-1">All</option>
				</select>
				<select className="fright" name="state_select" value={this.state.state_select} onChange={this.handleChange}>
					{state_options}
				</select>
				<div className="confirmed_chart_container"><Line data={confirmed_data} options={chart_options} /></div>
				<div className="recovered_chart_container"><Line data={recovered_data} options={chart_options} /></div>
				<div className="deceased_chart_container"><Line data={deceased_data} options={chart_options} /></div>
			</div>);
	}
}

export default ChartComponent;