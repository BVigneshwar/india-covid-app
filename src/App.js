import React from 'react';

import states from './States.js';
import {getDailyCount} from './Utility.js';
import ThemeContext from './ThemeContext.js';
import ChartContainer from './ChartComponent.js';
import MapComponent from './MapComponent.js';
import TableComponent from './TableComponent.js';

import './App.css';
import flag_img from './images/flag.png';
import dark_icon from './images/night_icon.png';
import light_icon from './images/light_icon.png';

const API_URL = "https://api.covid19india.org/v4/min/data-all.min.json";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			api_data_processed : false,
			dark_mode : false
		}
		this.handleChange = this.handleChange.bind(this);
	}
	
	componentDidMount() {
		fetch(API_URL).then(response => response.json()).then(data => {
			for(var date in data) {
				for(var state in data[date]) {
					if(states[state]){
						states[state].confirmed[date] = data[date][state].total.confirmed ? data[date][state].total.confirmed : 0;
						states[state].deceased[date] = data[date][state].total.deceased ? data[date][state].total.deceased : 0;
						states[state].recovered[date] = data[date][state].total.recovered ? data[date][state].total.recovered : 0;
						states[state].tested[date] = data[date][state].total.tested ? data[date][state].total.tested : 0;
						states[state].vaccinated[date] = data[date][state].total.vaccinated ? data[date][state].total.vaccinated : 0;
						if(data[date][state].districts) {
							for(var district in data[date][state].districts) {
								if(states[state].districts && !states[state].districts[district]){
									states[state].districts[district] = {
										confirmed : {},
										deceased : {},
										recovered : {},
										tested : {},
										vaccinated : {}
									};
								}
								if(states[state].districts && data[date][state].districts[district].total){
									states[state].districts[district].confirmed[date] = data[date][state].districts[district].total.confirmed ? data[date][state].districts[district].total.confirmed : 0;
									states[state].districts[district].deceased[date] = data[date][state].districts[district].total.deceased ? data[date][state].districts[district].total.deceased : 0;
									states[state].districts[district].recovered[date] = data[date][state].districts[district].total.recovered ? data[date][state].districts[district].total.recovered : 0;
									states[state].districts[district].tested[date] = data[date][state].districts[district].total.tested ? data[date][state].districts[district].total.tested : 0;
									states[state].districts[district].vaccinated[date] = data[date][state].districts[district].total.vaccinated ? data[date][state].districts[district].total.vaccinated : 0;
									states[state].districts[district].latest = date;
								}
							}
						}
						states[state].latest = date;
					}
				}
			}
			
			for(state in states){
				getDailyCount({state_code : state, date : states[state].latest, prop : "confirmed", latest : true});
			}
			
            this.setState({
				api_data_processed : true
			});
		});
	}
	
	handleChange(event) {
		this.setState({ dark_mode : !this.state.dark_mode });
	}
	
	render() {
		var themeIcon;
		if(this.state.dark_mode) {
			document.body.classList.add("dark_mode");
			themeIcon = (
				<div className="theme-icon-container fright" onClick={this.handleChange}>
					<img className="theme-icon" src={light_icon} />
					<span>Light mode</span>
				</div>
			);
		}else {
			document.body.classList.remove("dark_mode");
			themeIcon = (
				<div className="theme-icon-container fright" onClick={this.handleChange}>
					<img className="theme-icon" src={dark_icon} />
					<span>Dark mode</span>
				</div>
			);
		}
		return (
		<ThemeContext.Provider value={this.state.dark_mode ? "dark_mode" : "light_mode"}>
			<div className="app_container">
				<div id="header">
					<h2 className="fleft">COVID-19</h2>
					<img className="fright" src={flag_img}/>
					<h2 className="fright">INDIA</h2>
					{ themeIcon }
					<div className="clear"></div>
				</div>
				<MapComponent latest={states.TT.latest}/>
				<ChartContainer/>
				<TableComponent/>
			</div>
		</ThemeContext.Provider>
		);
	}
}

export default App;