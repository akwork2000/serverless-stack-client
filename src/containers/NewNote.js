import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, ControlLabel, DropdownButton, MenuItem, Row, Col  } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import config from "../config";
import "./NewNote.css";
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";
import Stopwatch from "../components/Stopwatch";
import Metronome from "../components/Metronome";
import styled from 'styled-components'
import MdPlayArrow from 'react-icons/lib/md/play-arrow'
import MdPause from 'react-icons/lib/md/pause'


const Header = styled.header`
  width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-variant-numeric: tabular-nums;
  & small {
    color: rgba(95, 158, 160, 0.7);
    text-transform: uppercase;
    font-size: 1.5rem;
  }
  `

  const Main = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 9.5vh;
`

export default function NewNote() {

  
  const file = useRef(null);
  const history = useHistory();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [practiceType, setPracticeType] = useState("Technique");
  const [practiceTime, SetPracticeTime] = useState(0);

  function validateForm() {
    return content.length > 0;
  }

  function handleFileChange(event) {
    file.current = event.target.files[0];
  }

  async function handleSubmit(event) {
    event.preventDefault();
  
    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }
  
    setIsLoading(true);
  
    try {
      const attachment = file.current ? await s3Upload(file.current) : null;
  
      await createNote({ practiceType, practiceTime, content, attachment });
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }
  
  
  function createNote(note) {
    return API.post("notes", "/notes", {
      body: note
    });
  }

  function handleTypeChange(event) {
    setPracticeType(event.target.value)
  }

  function handleTimerTimeChange(timerTime){
    SetPracticeTime(parseInt(Math.ceil(timerTime/60000)))
  }
 
  return (
    <div className="NewNote">
      <form onSubmit={handleSubmit}>
        <Header>
        <fieldset>
          <ControlLabel style={{ marginRight: '1rem', fontSize: '14px'} }>I am working on </ControlLabel>
          <select style={{ fontSize: '15px'}} value={practiceType} onChange={handleTypeChange}>
            <option value="Technique">{'Technique'}</option>
            <option value="Repertoire Piece">{'Repertoire'}</option>
            <option value="Old Repertoire Piece">{'Old Repertoire Piece'}</option>
            <option value="Musicianship">{'Musicianship'}</option>
          </select>
        </fieldset>
        <fieldset>
          <ControlLabel style={{ marginRight: '1rem', fontSize: '14px' }}>Practice Time (mins)</ControlLabel>
          <input type="number" name="PracticeTime" value={practiceTime} onChange={e => SetPracticeTime(parseInt(e.target.value))}/>  
        </fieldset>
        </Header>
        <FormGroup controlId="content">
          <FormControl
            value={content}
            componentClass="textarea"
            onChange={e => setContent(e.target.value)}
          />
        </FormGroup>
        
        <div class="Timers">
        
        
        
          <Stopwatch callbackTimerTimeChange={handleTimerTimeChange.bind(this)}/>
        
        
        
        
            <Metronome
                tempo={60}
                subdivision={4}
                beatsPerMeasure={1}
                render={({
                tempo,
                beatsPerMeasure,
                playing,
                beat,
                subdivision,
                onPlay,
                onTempoChange,
                onTSChange,
                onSubDivChange,
                }) => (
                <div className="Metronome">
                    <div className="Metronome-header">Metronome</div>
                    <div className="Metronome-details">
                    <Header> 
                      <select value={beatsPerMeasure} onChange={event => onTSChange(event.target.value)}>
                        <option value="1">1/4</option>
                        <option value="2">2/4</option>
                        <option value="3">3/4</option>
                        <option value="4">4/4</option>
                      </select>{' '}
                      <small>T.S.</small>
                      <select value={subdivision} onChange={event => onSubDivChange(event.target.value)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                      <small>Sub Div</small>
                    </Header> 
                    
                    </div>
                    
                    
                    <Header>
                    <input
                        type="range"
                        min={40}
                        max={240}
                        value={tempo}
                        onChange={event => onTempoChange(event.target.value)}
                    />
                    
                    </Header>
                    <div className="Metronome-details">
                    <Header align={'left'}>
                    <medium>{tempo} BPM </medium> 
                    <medium>{beat}/{beatsPerMeasure} </medium>
                    
                    <button className="Metronome-button" type="button" onClick={onPlay}>{playing ? 'Pause' : 'Play'}</button>
                    </Header>
                    </div>
                </div>
                )}
            />
        
        
        </div>
       
        
        <FormGroup controlId="file">
          <ControlLabel>Attachment</ControlLabel>
          <FormControl onChange={handleFileChange} type="file" />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          bsStyle="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Create
        </LoaderButton>
      </form>
    </div>
  );
}