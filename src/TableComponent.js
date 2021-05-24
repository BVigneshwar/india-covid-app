import React from 'react';
import DataTable from "react-data-table-component";

import states from './States.js';
import ThemeContext from './ThemeContext.js';
import {getDailyCount} from './Utility.js';

class TableComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			select_value : "TT"
		}
		this.handleChange = this.handleChange.bind(this);
	}
	
	handleChange(event) {
		this.setState({select_value : event.target.value});
	}
	
	render() {
		var options = Object.entries(states).map(data => <option key={data[0]} value={data[0]}>{data[1].name}</option>);
		var tableData = [];
		if(this.state.select_value == "TT"){
			Object.entries(states).map(data => {
				if(data[0] != "TT"){
					tableData.push({ 
						id : data[1].state_code,
						name : data[1].name,
						confirmed : getDailyCount({state_code : data[0], date : data[1].latest, prop : "confirmed", latest : true}),
						deceased : getDailyCount({state_code : data[0], date : data[1].latest, prop : "deceased", latest : true}),
						recovered : getDailyCount({state_code : data[0], date : data[1].latest, prop : "recovered", latest : true}),
						tested : data[1].tested[data[1].latest],
						vaccinated : data[1].vaccinated[data[1].latest],
						latest : data[1].latest
					});
				}
			});
		}else{
			Object.entries(states[this.state.select_value].districts).map(data => {
				if(data[0] != "Unknown"){
					tableData.push({
						id : this.state.select_value+"_"+data[0],
						name : data[0],
						confirmed : getDailyCount({state_code : this.state.select_value, date : data[1].latest, prop : "confirmed", district : data[0], latest : true}),
						deceased : getDailyCount({state_code : this.state.select_value, date : data[1].latest, prop : "deceased", district : data[0], latest : true}),
						recovered : getDailyCount({state_code : this.state.select_value, date : data[1].latest, prop : "recovered", district : data[0], latest : true}),
						tested : data[1].tested[data[1].latest],
						vaccinated : data[1].vaccinated[data[1].latest],
						latest : data[1].latest
					});
				}
			});
		}
		return (
			<div id="table_container">
				<select className="table_select" value={this.state.select_value} onChange={this.handleChange}>
					{options}
				</select>
				<DataTableWrapper tableData={tableData}/>
			</div>
		)
	}
}

function formatCell(row, prop) {
	var cell = "-";
	if(row[prop]){
		var d = row.id.split("_");
		cell = <div>
				<div>{d[1] ? states[d[0]].districts[d[1]][prop][row.latest] : states[d[0]][prop][row.latest]}</div>
				<div>({getDailyCount({state_code : d[0], district : d[1], date : row.latest, prop : prop, latest : true})})</div>
			</div>;
	}
	return (
		<div>
			{cell}
		</div>
	);
}


const lightTableStyle = {
	table: {
		style: {
			color: "#000000",
			backgroundColor: "#FFFFFF"
		}
	},
	style: {
		display: 'table'
    },
	headRow: {
		style: {
			backgroundColor: '#f5f5f5',
			minHeight: 'auto',
			borderBottom: 'none'
		}
	},
	headCells: {
		style: {
			fontSize: '14px',
			fontWeight: 700,
			padding: '10px 16px'
		},
		activeSortStyle: {
			color: "#000000",
			'&:focus': {
				outline: 'none'
			},
			'&:hover:not(:focus)': {
				color: "#000000"
			}
		},
		inactiveSortStyle: {
			'&:focus': {
				outline: 'none',
				color: "#000000"
			},
			'&:hover': {
				color: "#000000"
			}
		}
	},
	rows : {
		style : {
			backgroundColor: "#FFFFFF"
		}
	},
	cells: {
		style: {
			fontSize: '14px',
			textAlign : "center"
		}
	}
};

const darkTableStyle = {
	table: {
		style: {
			color: "rgba(255, 255, 255, 0.87)",
			backgroundColor: "#333333"
		}
	},
	style: {
		display: 'table'
    },
	headRow: {
		style: {
			backgroundColor: '#333333',
			minHeight: 'auto',
			borderBottom: 'none'
		}
	},
	headCells: {
		style: {
			fontSize: '14px',
			fontWeight: 700,
			color: "rgba(255, 255, 255, 0.87)",
			padding: '10px 16px'
		},
		activeSortStyle: {
			color: "rgba(255, 255, 255, 0.87)",
			'&:focus': {
				outline: 'none'
			},
			'&:hover:not(:focus)': {
				color: "rgba(255, 255, 255, 0.87)"
			}
		},
		inactiveSortStyle: {
			'&:focus': {
				outline: 'none',
				color: "rgba(255, 255, 255, 0.87)"
			},
			'&:hover': {
				color: "rgba(255, 255, 255, 0.87)"
			}
		}
	},
	rows : {
		style : {
			backgroundColor: "#3A3B3C"
		}
	},
	cells: {
		style: {
			fontSize: '14px',
			textAlign : "center",
			color: "rgba(255, 255, 255, 0.6)"
		}
	}
};

const dataTableConfig = {
	noHeader : true,
	fixedHeader : true,
	fixedHeaderScrollHeight : 'calc(100vh - 150px)'
}

class DataTableWrapper extends React.Component {
	static contextType = ThemeContext;

	constructor(props) {
		super(props);
	}
	
	render() {
		let customStyles = lightTableStyle;
		let columnStyles = {
			confirmed : { backgroundColor : '#f3e5f5' },
			recovered : { backgroundColor : '#e8f5e9' },
			deceased : { backgroundColor : '#fbe9e7' },
			tested : { backgroundColor : "#fffde7" },
			vaccinated : { backgroundColor : '#e1f5fe' }
		}
		if(this.context == "dark_mode"){
			customStyles = darkTableStyle;
			columnStyles = {
				confirmed : { color : 'rgb(206, 147, 216)' },
				recovered : { color : 'rgb(165, 214, 167)' },
				deceased : { color : 'rgb(239, 154, 154)' },
				tested : { color : "#fff59d" },
				vaccinated : { color : '#81d4fa' }
			}
		}
		
		const columns = [
			{ name : "Name", selector : "name", sortable : true, style : { textAlign : "left" }, minWidth : "200px" },
			{ name : "Confirmed", selector : "confirmed", sortable : true, center : true, style : columnStyles.confirmed, cell : (row) => formatCell(row, "confirmed") },
			{ name : "Recovered", selector : "recovered", sortable : true, center : true, style : columnStyles.recovered, cell : (row) => formatCell(row, "recovered") },
			{ name : "Deceased", selector : "deceased", sortable : true, center : true, style : columnStyles.deceased, cell : (row) => formatCell(row, "deceased") },
			{ name : "Tested", selector : "tested", sortable : true, center : true, style : columnStyles.tested, cell : (row) => row["tested"] ? row["tested"] : '-' },
			{ name : "Vaccinated", selector : "vaccinated", sortable : true, center : true, style : columnStyles.vaccinated, cell : (row) => row["vaccinated"] ? row["vaccinated"] : '-' },
			{ name : "Last Updated on", selector : "latest", sortable : false, right : true, style : { textAlign : "right" }, cell : (row) => row["latest"] ? row["latest"] : '-' }
		];
		
		return <DataTable columns={columns} data={this.props.tableData} customStyles={customStyles} {...dataTableConfig}/>;
	}
}

export default TableComponent;