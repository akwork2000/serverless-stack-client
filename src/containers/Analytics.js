import React, { useState, useEffect } from "react";
import { PageHeader, Alert, Row, Col } from "react-bootstrap";
import { onError } from "../libs/errorLib";
import { API } from "aws-amplify";

// Individual component imports
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryLegend,
  VictoryPie,
  VictoryZoomContainer,
} from "victory";





export default function Analytics() {
    const [isLoading, setIsLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [result, setResult] = useState([]);
    const [dayseries, setDayseries] = useState([]);
    //const [counters, setCounters] = useState([]);
    //const [timeseries, setTimeseries] = useState([]);
    const [sessions, setSessions] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [bestTime, setBestTime] = useState(0);
    const [dayavgTime, setDayavgTime] = useState(0);

    useEffect(() => {
        async function onLoad() {
          try {
            //const counters = await loadCounters();
            //setCounters(counters);
            //setSessions(counters[0].sessions);
            //setTotalTime(counters[0].totalTime);
            const notes = await loadNotes();
            setNotes(notes);
            notes.sort(function(a,b) { return a.createdAt - b.createdAt; });
            setSessions(notes.length);
            var maxTime = Math.max.apply(null, notes.map(item => item.practiceTime));
            setBestTime(maxTime);
            var result = notes.reduce(function(res, obj) {
                if (!(obj.practiceType in res)){
                    let obj1 = JSON.parse(JSON.stringify(obj));
                    obj1.name = obj.practiceType;
                    res.__array.push(res[obj.practiceType] = obj1);}
                else {
                    res[obj.practiceType].practiceTime += obj.practiceTime;
                }
                return res;
            }, {__array:[]}).__array;
                            //.sort(function(a,b) { return b.bytes - a.bytes; });
            setResult(result);
            let sumTime = 0;
            result.forEach((item) => { sumTime += item.practiceTime; });
            setTotalTime(sumTime);
            // To calculate the no. of days between two dates 
            var diffInDays = (new Date(notes[notes.length-1].createdAt).getTime() - new Date(notes[0].createdAt).getTime()) / (1000 * 3600 * 24); 
            var dayaverage = Math.ceil(sumTime/diffInDays);
            setDayavgTime(dayaverage);
            
            var dayseries = notes.reduce(function(res, obj) {
                var d1 = new Date(obj.createdAt).toLocaleDateString();
                if (!(d1 in res)){
                    let obj1 = JSON.parse(JSON.stringify(obj));
                    obj1.practicedate = d1;
                    res.__array.push(res[d1] = obj1);}
                else {
                    res[d1].practiceTime += obj.practiceTime;
                }
                return res;
            }, {__array:[]}).__array;
                            //.sort(function(a,b) { return b.bytes - a.bytes; });
            setDayseries(dayseries);
            //const timeseries = await loadTimeseries();
            //setTimeseries(timeseries);
          } catch (e) {
            onError(e);
          }
          setIsLoading(false);
        }
        onLoad();
      }, []);

    /* function loadCounters() {
        return API.get("notes", "/counters");
    } */

    /* function loadTimeseries() {
        return API.get("notes", "/timeseries");
    } */

    function loadNotes() {
        return API.get("notes", "/notes");
      }

    function renderPracticeTimeChart(dayseries) {
        return (
            <div>
            <VictoryChart theme={VictoryTheme.grayscale} domainPadding={20} height={300}
                    containerComponent={
                        <VictoryZoomContainer 
                        allowZoom={true}
                        zoomDomain={{x: [dayseries.length - 9,dayseries.length+1 ]}}
                        zoomDimension="x"
                        />
                    }>
                    {/*<VictoryAxis offsetX={800}
                        tickLabelComponent={<VictoryLabel  textAnchor="start" />}
                        style={{tickLabels: { angle: 45 , fontSize: 6 }, offsetX: 80}}
                        />
                    <VictoryAxis dependentAxis 
                    style={{tickLabels: { fontSize: 6 }, offsetX: 80}}
                    />*/}
                    <VictoryBar  barWidth={10}
                    style={{ data: { fill: "orangered" } }}//#F4511E
                    data={dayseries}
                    //labels={({ datum }) => `${datum.totalTime} min`}
                    labels={({ datum }) => `${datum.practiceTime} min`}
                    labelComponent={<VictoryTooltip  flyoutHeight={20} />}
                    //y="totalTime"
                    y="practiceTime"
                    //x={(d) => (new Date(d.practicedate).toLocaleDateString().slice(0,-5))}
                    //x={(d) => (new Date(d.practicedate).getUTCMonth()+1 + "/" + new Date(d.practicedate).getUTCDate())}
                    x={(d) => (d.practicedate.slice(0,-5))}
                    //labels={d => "y=" + d.totalTime }
                    /* data={[
                        { x: "12/1", y: 15 },
                        { x: "1/1", y: 30 },
                        { x: "3/1", y: 12 },
                        { x: "6/1", y: 60 },
                        { x: "7/1", y: 60 },
                        { x: "8/1", y: 20 },
                        ]}*/
                    /> 
                    <VictoryAxis
                        label="practice date"
                        style={{
                            axisLabel: { padding: 30, fontSize: 15 },
                            tickLabels: { angle: 0 , fontSize: 10, padding: 10 }
                        }}
                        />
                        <VictoryAxis dependentAxis
                        label="pracice time (Min)"
                        style={{
                            axisLabel: { padding: 35, fontSize: 15 },
                            tickLabels: { fontSize: 10, padding: 10 }
                        }}
                    />
                </VictoryChart>
                </div>
        );
    }

    function renderPracticePieChart(result) {
        return (
            <div>
                <VictoryLegend x={10} y={40}
                    height={150}
                    orientation="horizontal"
                    itemsPerRow={3}
                    gutter={20}
                    style={{ border: { stroke: "black" } }}
                    standalone={true}
                    colorScale="red" //{["tomato", "orange", "gold", "cyan", "navy" ]}
                    //x={20} y={40}
                    //gutter={20}
                    //title="Legend"
                    centerTitle
                    //style={{ border: { stroke: "black" }, title: {fontSize: 20 } }}
                    data={result}
                />
                <VictoryPie
                height={150}
                padding={{ 
                    left: 0, bottom: 20, top: 0
                }}
                colorScale="red"//{["tomato", "orange", "gold", "cyan", "navy" ]}
                data={result}
                labelComponent={<VictoryTooltip/>}
                labelRadius={50}
                //labels={() => null}
                labels={({ datum }) => `${datum.practiceTime} min`}
                //labels={({ datum }) => datum.practiceTime}
                //style={{ labels: { fill: "black" } }}
                
                //labelComponent={<VictoryLabel angle={0}/>}
                y="practiceTime"
                //x={(d) => (new Date(d.practicedate).toLocaleDateString().slice(0,-5))}
                x="practiceType"
                //style={{ labels: { fill: "black", fontSize: 8, fontWeight: "normal" } }}
                >
                </VictoryPie>
            </div>
        );
    }

    return (
        <div >
            <div>
                <PageHeader></PageHeader>
            </div>
            <div>
                <Row align={'center'}>
                <Col xs={5} md={6} lg={6} align={'center'}>
                    <Alert bsStyle="warning">
                        <h6>Total sessions</h6>
                        <p>
                        <h2>{sessions}</h2>
                        </p>
                        <hr></hr>
                        <h6>Daily avg time</h6>
                        <p>
                        <h2>{dayavgTime} min</h2>
                        </p>
                    </Alert>
                </Col>
                <Col xs={6} md={6} lg={6} align={'center'}>
                    <Alert  bsStyle="warning">
                        <h6>Total practice time</h6>
                        <p>
                        <h2>{totalTime} min</h2>
                        </p>
                        <hr></hr>
                        <h6>Best time</h6>
                        <p>
                        <h2>{bestTime} min</h2>
                        </p>
                    </Alert>
                </Col>
                </Row>
                <PageHeader></PageHeader>
                <h3>Daily practice time</h3>
                <div align={'center'} style={{ width: "90%", margin: 4}}>
                    {!isLoading && renderPracticeTimeChart(dayseries)}
                </div>
                <PageHeader></PageHeader>
                <h3>Practice distribution</h3>
                <div align={'center'} style={{ width: "90%", margin: 4}}>
                    {!isLoading && renderPracticePieChart(result)}
                </div>
            </div>
        </div>
      );
}