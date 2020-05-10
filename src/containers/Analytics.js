import React, { useState, useEffect } from "react";
import { PageHeader, Alert, Row, Col } from "react-bootstrap";
import { onError } from "../libs/errorLib";
import { API } from "aws-amplify";

import victory from "victory";

// Individual component imports
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
  VictoryTheme,
} from "victory";





export default function Analytics() {
    const [isLoading, setIsLoading] = useState(true);
    const [counters, setCounters] = useState([]);
    const [timeseries, setTimeseries] = useState([]);
    const [sessions, setSessions] = useState(0);
    const [totalTime, setTotalTime] = useState(0);

    useEffect(() => {
        async function onLoad() {
          try {
            const counters = await loadCounters();
            setCounters(counters);
            setSessions(counters[0].sessions);
            setTotalTime(counters[0].totalTime);
            const timeseries = await loadTimeseries();
            setTimeseries(timeseries);
          } catch (e) {
            onError(e);
          }
          setIsLoading(false);
        }
        onLoad();
      }, []);

    function loadCounters() {
        return API.get("notes", "/counters");
    }

    function loadTimeseries() {
        return API.get("notes", "/timeseries");
    }

    function renderPracticeTimeChart(timeseries) {
        return (
            <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
                    {/*<VictoryAxis offsetX={800}
                        tickLabelComponent={<VictoryLabel  textAnchor="start" />}
                        style={{tickLabels: { angle: 45 , fontSize: 6 }, offsetX: 80}}
                        />
                    <VictoryAxis dependentAxis 
                    style={{tickLabels: { fontSize: 6 }, offsetX: 80}}
                    />*/}
                    <VictoryBar  barWidth={10}
                    style={{ data: { fill: "#F4511E" } }}
                    data={timeseries}
                    y="totalTime"
                    x={(d) => (new Date(d.practicedate).toLocaleDateString())}
                    
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
                            axisLabel: { padding: 30 }
                        }}
                        />
                        <VictoryAxis dependentAxis
                        label="pracice time"
                        style={{
                            axisLabel: { padding: 40 }
                        }}
                    />
                </VictoryChart>
        );
    }
    return (
        <div>
            <div>
                <PageHeader>Practices Dashboard</PageHeader>
            </div>
            <div>
                <Row>
                <Col sm={6} align={'center'}>
                    <Alert style={{ width: '20rem' }} bsStyle="warning">
                        <h4>Total Sessions</h4>
                        <p>
                        <h1>{sessions}</h1>
                        </p>
                    </Alert>
                </Col>
                <Col sm={6} align={'center'}>
                    <Alert style={{ width: '20rem' }} bsStyle="warning">
                        <h4>Total Practice Time</h4>
                        <p>
                        <h1>{totalTime} Min</h1>
                        </p>
                    </Alert>
                </Col>
                </Row>
                <PageHeader>Progress</PageHeader>
                <div align={'center'} style={{ width: "50%"}}>
                    {!isLoading && renderPracticeTimeChart(timeseries)}
                </div>
            </div>
        </div>
      );
}