import React from 'react';
import './App.scss';
import _ from 'lodash';
import 'moment';
import moment from 'moment';
import Chart from 'react-apexcharts'
import interpolate from 'color-interpolate'
import PullToRefresh from 'pulltorefreshjs';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      entries: [],
      range:'today',
      currentUsage:'',
      todayUsage:'',
      options: {
        chart: {
          id: 'data-usage'
        },
        xaxis: {
          categories: []
        }
      },
      series: [{
        name: 'usage',
        data: []
      }],
      dataLabels: {
        enabled: false,
      },
      todayGaugeOptions:{},
      todayGaugeSeries:[]
    };
  }

  componentWillMount() {
      this.getEntries();
  }
  componentDidMount(){
    const ptr = PullToRefresh.init({
      mainElement: 'body',
      onRefresh:()=> {
        window.location.reload();
      }
    });
   
  }
  getEntries() {
    fetch("http://"+window.location.hostname+":3901/api/all?timestamp="+ moment().valueOf())
        .then(res => res.text())
        .then(
          (res) => {
            const resData = JSON.parse(res);
            this.setState({ entries: resData }, this.updateChartData.bind(this))
     
          } 
        );
  }
  updateChartData(){
    let periodStartTime;
    let periodEndTime;
    if(moment().date(9).endOf('day').isBefore(moment())){
      periodStartTime=moment().date(10).startOf('day')
      periodEndTime=moment().date(10).add(1,'months').endOf('day')
    }else{
      periodStartTime=moment().date(10).subtract(1,'months').startOf('day')
      periodEndTime=moment().date(10).endOf('day')
    }
    const daysUntilPeriodEnd = periodEndTime.diff(moment(),'days');
    // console.log(moment().date(9).endOf('day').format("dddd, MMMM Do YYYY, h:mm:ss a"));
    // console.log(moment().format("dddd, MMMM Do YYYY, h:mm:ss a"));
    
    const todayStartTime=moment().startOf('day');
    const todayDataPartition = _.partition(this.state.entries, function(o) { 
      return moment(o.time).isBefore(todayStartTime);
    });
    const prevTodayData = todayDataPartition[0];
    const todayData = todayDataPartition[1];    

    const periodData = _.partition(this.state.entries, function(o) { 
      return moment(o.time).isBefore(periodStartTime);
    });
    const prevPeriodData = periodData[0];
    const currentPeriodData = periodData[1];
    // console.log(prevPeriodData);
    let dataSet = currentPeriodData;
    if(this.state.range=='last-hour'){
      dataSet = _.filter(this.state.entries, function(o) { 
        return moment(o.time).isSameOrAfter(moment().subtract(1,'hour'));
      });
    }else if(this.state.range=='all'){
      dataSet = this.state.entries;
    }else if(this.state.range=='today'){
      dataSet = todayData;
    }

    //console.log(dataSet);
    const lastUsagePrevToday = parseFloat(_.last(prevTodayData).usage);
    const lastUsagePrevPeriod = parseFloat(_.last(prevPeriodData).usage);
    const currentUsageThisPeriod = (parseFloat(_.last(this.state.entries).usage)-lastUsagePrevPeriod).toFixed(2);
    const remainingDataThisPeriod = 200-currentUsageThisPeriod;
    const remainingDailyDataThisPeriod = (remainingDataThisPeriod/daysUntilPeriodEnd).toFixed(2);
    const currentUsageToday = (parseFloat(_.last(this.state.entries).usage)-lastUsagePrevToday).toFixed(2);
    const timeData = _.map(dataSet, 'time')
    const usageData = _.map(dataSet, 'usage')
    const usageSeries = usageData.map((v)=>{
      return (parseFloat(v)-lastUsagePrevPeriod).toFixed(2)
    })
    let gaugeColorMap = interpolate(['#33e9ab','#67b244', '#E0B336','#fd9a2d', '#fd5f76']);
    const timeLabels = timeData.map((v)=>{
      return moment(v).format("dd M, h:mmA");
    })
    this.setState({
      currentUsage:currentUsageThisPeriod,
      todayUsage:currentUsageToday,
      remainingDailyDataThisPeriod:remainingDailyDataThisPeriod,
      options:{
        chart: {
          id: 'data-usage'
        },
        xaxis: {
          categories: timeLabels
        },
        dataLabels: {
          enabled: false,
        }
      },
      series:[{
        name: 'usage',
        data: usageSeries
      }],

          
      todayGaugeSeries: [currentUsageToday/remainingDailyDataThisPeriod*100],
      todayGaugeOptions: {
        chart: {
          type: 'radialBar',
          offsetY: -20,
          sparkline: {
            enabled: true
          },
          
        },  
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background: "#e7e7e7",
              strokeWidth: '97%',
              margin: 5, // margin is in pixels
            },
            dataLabels: {
              name: {
                show: false,
              },
              value: {
                show: false,
              }
            }
          }
        },
        grid: {
          padding: {
            top: -10
          }
        },
        fill: {
          colors: [gaugeColorMap(currentUsageToday/remainingDailyDataThisPeriod)]
        },
      },
    })
  }
  setRange(range){
    this.setState({range:range},this.updateChartData.bind(this));
  }

  render(){
    return (
      <div className="App">
        <div className="app-inner">

          
          <header className="header">
            <div className="kpi">
              <div className="kpi-data">
                <div className="label">Month's Usage</div>
                <div className="number">{this.state.currentUsage}<span className="unit"> / 200GB</span></div>
              </div>
            </div>
            <div className="kpi">
              <div className="meter">
                <Chart options={this.state.todayGaugeOptions} series={this.state.todayGaugeSeries} type="radialBar" height="280" />
              </div>
              <div className="kpi-data">
                <div className="label">Today's Usage</div>
      <div className="number">{this.state.todayUsage}<span className="unit"> / { this.state.remainingDailyDataThisPeriod}GB</span></div>
              </div>
            </div>
          </header>
          <div 
            className={['chart-panel',`range-${this.state.range}`].join(' ')}
          >
            <nav id="nav">
              <div className="nav-inner">
                <a className="nav-item nav-item-today" onClick={this.setRange.bind(this,'today')}>Today</a>
                <a className="nav-item nav-item-current-period" onClick={this.setRange.bind(this,'current-period')}>This Month</a>
                <a className="nav-item nav-item-last-hour" onClick={this.setRange.bind(this,'last-hour')}>Last Hour</a>
                <a className="nav-item nav-item-all" onClick={this.setRange.bind(this,'all')}>All</a>
              </div>
            </nav>
            <Chart options={this.state.options} toolbar={this.state.toolbar} series={this.state.series} type="area" height="300" />

          </div>
        </div>
      </div>
    );
  }
}

export default App;
