import React from 'react';
import ReactTooltip from 'react-tooltip';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

import states from './States.js';
import ThemeContext from './ThemeContext.js';
import {dateFormat, getDailyCount, numberWithCommas, ColorScale} from './Utility.js';

const INDIA_TOPO_JSON = require('./india.topo.json');

const PROJECTION_CONFIG = {
  scale: 400,
  center: [82.9629, 22.5937]
};

const DEFAULT_COLOR = '#EEE';
const colorScale = new ColorScale();

const light_geographyStyle = {
	default : {
		outline: 'none',
		stroke:'#FFFFFF',
		strokeWidth : '0.1'
	},
	hover : {
		outline: 'none',
		strokeWidth : '0.1'
	},
	pressed : {
		outline: 'none'
	}
};

const dark_geographyStyle = {
	default : {
		outline: 'none',
		stroke:'#333333',
		strokeWidth : '0.1'
	},
	hover : {
		outline: 'none',
		strokeWidth : '0.1'
	},
	pressed : {
		outline: 'none'
	}
};

class MapComponent extends React.Component {
	static contextType = ThemeContext;
	constructor(props) {
		super(props);
		this.state = {
			map_hover : "",
			date : new Date().getTime(),
			prop : "confirmed"
		}
		this.state.count = this.updateCount(this.state.date, this.state.prop);
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	
	updateCount(date, prop) {
		date = dateFormat(new Date(date));
		let count = {};
		let today = dateFormat(new Date());
		for(var state in states){
			count[state] = getDailyCount({state_code : state, date : date, prop : prop, latest : date == today ? true : false});
		}
		return count;
	}
	
	onMouseEnter(state_code) {
		if(states[state_code]){
			this.setState({
				map_hover : formatToolTip(state_code, this.state)
			});
		}
	}
	
	onMouseLeave() {
		this.setState({
			map_hover : ""
		});
	}
	
	handleChange(event) {
		if(event.target.name == "date_range"){
			let date = Number(event.target.value);
			let count = this.updateCount(date, this.state.prop);
			this.setState({date : date, count : count});
		}else if(event.target.name == "prop_select"){
			let prop = event.target.value;
			let count = this.updateCount(this.state.date, prop);
			this.setState({ prop : prop, count : count});
		}
	}
	
	componentDidUpdate(prevProps) {
		if(!prevProps.latest && this.props.latest) {
			let date = new Date(this.props.latest).getTime();
			let count = this.updateCount(date, this.state.prop);
			this.setState({date : date, count : count});
		}
	}
	
	render() {
		let min_range = new Date("2020-03-03").getTime();
		let max_range;
		if(this.props.latest){
			max_range = new Date(this.props.latest).getTime();
		}else{
			max_range = new Date().getTime();
		}
		let count = this.state.count;
		let tooltipStyle = {}, geographyStyle= {};
		if(this.context == "dark_mode") {
			Object.assign(tooltipStyle, common_tooltipStyle, dark_tooltipStyle);
			Object.assign(geographyStyle, dark_geographyStyle);
		}else {
			Object.assign(tooltipStyle, common_tooltipStyle, light_tooltipStyle);
			Object.assign(geographyStyle, light_geographyStyle);
		}
		return (
		<div id="map_container" className={this.state.prop}>
			<div className="total_count_wrapper">
				<div className="total_count_container confirmed">
					<div className="total_label">Total Confirmed Cases</div>
					<div className="total_count">{states.TT.latest ? numberWithCommas(states.TT.confirmed[states.TT.latest]) : '-'}</div>
				</div>
				<div className="total_count_container recovered">
					<div className="total_label">Total Recovered Cases</div>
					<div className="total_count">{states.TT.latest ? numberWithCommas(states.TT.recovered[states.TT.latest]) : '-'}</div>
				</div>
				<div className="total_count_container deceased">
					<div className="total_label">Total Deceased Cases</div>
					<div className="total_count">{states.TT.latest ? numberWithCommas(states.TT.deceased[states.TT.latest]) : '-'}</div>
				</div>
				<div className="total_count_container2 vaccinated">
					<div className="total_label">Total Vaccinated Count</div>
					<div className="total_count">{states.TT.latest ? numberWithCommas(states.TT.vaccinated[states.TT.latest]) : '-'}</div>
				</div>
				<div className="total_count_container2 recovery_rate">
					<div className="total_label">Total Recovery Rate</div>
					<div className="total_count">{states.TT.latest ?  (states.TT.recovered[states.TT.latest]*100/states.TT.confirmed[states.TT.latest]).toFixed(2) + "%" : '-'}</div>
				</div>
			</div>
			<div className="map_select_container" style={{width: '90%', margin: 'auto'}}>
				<select className="map_select" name="prop_select" value={this.state.prop} onChange={this.handleChange}>
					<option value="confirmed">Confirmed chart</option>
					<option value="recovered">Recovered chart</option>
					<option value="deceased">Deceased chart</option>
				</select>
				<div className="fright" style={{marginTop : '15px'}}>as on ( {dateFormat(new Date(this.state.date))} )</div>
				<div className="clear"></div>
			</div>
			<div id="slide_container">
				<input type="range" name="date_range" min={min_range} max={max_range} value={this.state.date} className="slider" onChange={this.handleChange}/>
			</div>
			<ReactTooltip {...tooltipStyle}>{this.state.map_hover}</ReactTooltip>
			<div id="map_svg_wrapper">
				<ComposableMap projectionConfig={PROJECTION_CONFIG} projection="geoMercator" width={220} height={220} style={{outline : 'none'}} data-tip="">
					<Geographies geography={INDIA_TOPO_JSON}>
						{({ geographies }) =>
							
							geographies.map(geo => {
								let c;
								if(count && typeof(count[geo.id]) != "undefined") {
									c = count[geo.id];
								}
								return (
								  <Geography 
									key={geo.rsmKey}
									geography={geo} fill={c ? colorScale.scale(this.state.prop, c) : DEFAULT_COLOR}
									style={geographyStyle}
									onMouseEnter={() => this.onMouseEnter(geo.id) }
									onMouseLeave={this.onMouseLeave}
								  />
								);
							})
						
						}
					</Geographies>
				</ComposableMap>
			</div>
			<ColorLegend prop={this.state.prop}/>
			
		</div> );
	}
}

const common_tooltipStyle = {
	html : true,
	type : "light",
	className : "tooltip_wrapper"
}

const light_tooltipStyle = {
	className : "tooltip_wrapper",
	textColor : "#000000",
	backgroundColor : "#FFFFFF",
	arrowColor : "#FFFFFF"
}

const dark_tooltipStyle = {
	className : "tooltip_wrapper dark_mode",
	textColor : "rgba(255, 255, 255, 0.87)",
	backgroundColor : "#444444",
	arrowColor : "#444444"
}

function formatToolTip(state_code, opts){
	var count = opts.count[state_code];
	var backgroundColor = count ? colorScale.scale(opts.prop, count) : DEFAULT_COLOR;
	var prop = "Confirmed";
	if(opts.prop == "recovered") {
		prop = "Recovered";
	}else if(opts.prop == "deceased") {
		prop = "Deceased";
	}
	var today = dateFormat(new Date());
	var date = dateFormat(new Date(opts.date));
	if(today == date) {
		date = states[state_code].latest;
	}
	if(typeof(count) == "undefined") {
		count = "-";
	}
	var format = '<div class="tooltip_container">\
					<div class="color_container" style="background:'+backgroundColor+'"></div>\
					<div class="tooltip_details">\
						<h3>'+states[state_code].name+'</h3>\
						<div class="count_container">\
							<div class="label">'+prop+' : </div>\
							<div class="count">\
								<div style="font-weight: 700">'+count+'</div><div>(as on '+date+')</div>\
							</div>\
						</div>\
						<div>\
							<span style="display: inline-block; vertical-align: top; width: 55px;">Helpline : </span>\
							<span style="font-weight: 700; display: inline-block; width: calc(100% - 60px);">'+states[state_code].helpline+'</span>\
						</div>\
					</div>\
				</div>';
	return format;
}

function ColorLegend(props) {
	var colorDiv = colorScale.color_range[props.prop].map((data, index) => <span key={index} className="color_legend" style={{backgroundColor : data}}></span> );
	var max = colorScale.max[props.prop];
	var labelDiv = [];
	for(var i=0; i<10; i++){
		var data = Math.round((i*max)/9);
		if(data > 1000){
			data = (data/1000).toFixed(2) + "k";
		}
		labelDiv.push(<span className="color_label">{data}</span>);
	}
	return (
		<div className="color_legend_container">
			<div>{colorDiv}</div>
			<div>{labelDiv}</div>
		</div>
	);
}

export default MapComponent;