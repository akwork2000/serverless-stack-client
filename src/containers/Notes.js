import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../libs/errorLib";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./Notes.css";
import { s3Upload } from "../libs/awsLib";
import styled from 'styled-components'

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

export default function Notes() {
  const file = useRef(null);
  const { id } = useParams();
  const history = useHistory();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [practiceType, setPracticeType] = useState("Technique");
  const [practiceTime, SetPracticeTime] = useState(0);
  const [oldpTime, SetOldpTime] = useState(0);
  const [createdAt, SetCreatedAt] = useState(0);

  useEffect(() => {
    function loadNote() {
      return API.get("notes", `/notes/${id}`);
    }

    async function onLoad() {
      try {
        const note = await loadNote();
        const { practiceType, practiceTime, content, createdAt, attachment } = note;

        if (attachment) {
          note.attachmentURL = await Storage.vault.get(attachment);
        }

        setContent(content);
        setPracticeType(practiceType);
        SetPracticeTime(practiceTime);
        SetOldpTime(practiceTime);
        SetCreatedAt(createdAt);
        setNote(note);
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, [id]);

  function validateForm() {
    return content.length > 0;
  }
  
  function formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }
  
  function handleFileChange(event) {
    file.current = event.target.files[0];
  }
  
  function handleTypeChange(event) {
    setPracticeType(event.target.value)
  }

  function saveNote(note) {
    return API.put("notes", `/notes/${id}`, {
      body: note
    });
  }
  
  async function handleSubmit(event) {
    let attachment;
  
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
      if (file.current) {
        attachment = await s3Upload(file.current);
      }
  
      await saveNote({
        content,
        attachment: attachment || note.attachment,
        practiceType,
        practiceTime,
        createdAt,
        oldpTime,
      });
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }
  
  function deleteNote(note) {
    return API.del("notes", `/notes/${id}`, {
      body: note
    });
  }
  
  async function handleDelete(event) {
    event.preventDefault();
  
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );
  
    if (!confirmed) {
      return;
    }
  
    setIsDeleting(true);
  
    try {
      await deleteNote({
        createdAt,
        oldpTime,
      });
      history.push("/");
    } catch (e) {
      onError(e);
      setIsDeleting(false);
    }
  }
  
  return (
    <div className="Notes">
      {note && (
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
          {/* <fieldset>
            <ControlLabel style={{ marginRight: '2rem' }}>I am working on :</ControlLabel>{" "}
            <label style={{ marginRight: '2rem' }}> Technique <input type="radio" name="Technique" value="Technique" checked={practiceType === "Technique"} onChange={handleTypeChange} /> </label> {}
            <label style={{ marginRight: '2rem' }}> Repertoire Piece <input type="radio" name="Repertoire Piece" value="Repertoir Piece" checked={practiceType === "Repertoir Piece"} onChange={handleTypeChange} /> </label> {}
            <label style={{ marginRight: '2rem' }}> Musicianship <input type="radio" name="Musicianship" value="Musicianship" checked={practiceType === "Musicianship"} onChange={handleTypeChange} /> </label> {}
            <label style={{ marginLeft: '15rem' }}> Practice Time: <input type="number" name="PracticeTime" value={practiceTime} onChange={e => SetPracticeTime(parseInt(e.target.value))}/> </label> {"mins"}
          </fieldset> */}
          <FormGroup controlId="content">
            <FormControl
              value={content}
              componentClass="textarea"
              onChange={e => setContent(e.target.value)}
            />
          </FormGroup>
          {note.attachment && (
            <FormGroup>
              <ControlLabel>Attachment</ControlLabel>
              <FormControl.Static>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={note.attachmentURL}
                >
                  {formatFilename(note.attachment)}
                </a>
              </FormControl.Static>
            </FormGroup>
          )}
          <FormGroup controlId="file">
            {!note.attachment && <ControlLabel>Attachment</ControlLabel>}
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
            Save
          </LoaderButton>
          <LoaderButton
            block
            bsSize="large"
            bsStyle="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </LoaderButton>
        </form>
      )}
    </div>
  );
}