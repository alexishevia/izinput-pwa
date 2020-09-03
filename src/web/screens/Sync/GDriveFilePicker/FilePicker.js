import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonModal,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonButtons,
  IonButton,
  IonIcon,
  IonLoading,
  IonList,
  IonItem,
  IonContent,
} from "@ionic/react";
import {
  chevronBackOutline,
  documentOutline,
  folderOutline,
  alertCircleOutline,
} from "ionicons/icons";
import loadDir from "./api/loadDir";
import useErrors from "../../../hooks/useErrors";
import Errors from "../../../Errors";

function isFile(node) {
  return node.fileType === "file";
}

function isDir(node) {
  return node.fileType === "directory";
}

function getParentDir(path) {
  return path.split("/").slice(0, -1).join("/");
}

function getCurrentDir(path) {
  return path.split("/").pop();
}

function getName(node) {
  return isDir(node) ? `${node.name}/` : node.name;
}

function getIcon(node) {
  if (isFile(node)) return documentOutline;
  if (isDir(node)) return folderOutline;
  return alertCircleOutline;
}

function FilePickerHeader({ onGoBack, path }) {
  return (
    <IonToolbar color="secondary">
      <IonButtons slot="start">
        <IonButton onClick={onGoBack}>
          <IonIcon icon={chevronBackOutline} />
        </IonButton>
      </IonButtons>
      <IonTitle>Select File</IonTitle>
      <IonLabel>{path}</IonLabel>
    </IonToolbar>
  );
}

FilePickerHeader.propTypes = {
  path: PropTypes.string.isRequired,
  onGoBack: PropTypes.func.isRequired,
};

export default function FilePicker({ onCancel, onFilePick }) {
  const [path, setPath] = useState("");
  const [pathIDs, setPathIDs] = useState("root");
  const [contents, setContents] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [errors, addError, dismissErrors] = useErrors([]);

  useEffect(() => {
    async function loadDirContents() {
      if (isLoading || errors.length || contents !== null) return;
      setIsLoading(true);
      dismissErrors();
      try {
        const result = await loadDir({ id: getCurrentDir(pathIDs) });
        setIsLoading(false);
        setContents(result.contents);
      } catch (err) {
        addError(err);
        setIsLoading(false);
      }
    }
    loadDirContents();
  }, [
    isFileSelected,
    pathIDs,
    addError,
    contents,
    dismissErrors,
    errors.length,
    isLoading,
  ]);

  function onGoBack(evt) {
    evt.preventDefault();
    if (path === "") {
      onCancel();
      return;
    }
    setIsLoading(false);
    dismissErrors();
    setContents(null);
    setIsFileSelected(false);
    setPath(getParentDir(path));
    setPathIDs(getParentDir(pathIDs));
  }

  function openNode(evt, node) {
    evt.preventDefault();
    if (isDir(node)) {
      setIsLoading(false);
      dismissErrors();
      setPath(`${path}/${node.name}`);
      setPathIDs(`${pathIDs}/${node.id}`);
      setContents(null);
      setIsFileSelected(false);
      return;
    }
    if (isFile(node)) {
      setIsFileSelected(true);
      onFilePick(node);
      return;
    }
    addError(new Error(`Filepicker: Unkown node type: ${node.type}`));
  }

  return (
    <IonModal isOpen>
      <FilePickerHeader path={path} onGoBack={onGoBack} />
      {contents && !contents.length ? (
        <IonItem>
          <p>The directory is empty.</p>
        </IonItem>
      ) : null}
      {contents && contents.length ? (
        <IonContent>
          <Errors errors={errors} onDismiss={dismissErrors} />
          <IonList>
            {contents.map((item) => {
              return (
                <IonItem
                  key={item.id}
                  style={{ cursor: "pointer" }}
                  onClick={(evt) => openNode(evt, item)}
                >
                  <IonIcon icon={getIcon(item)} />
                  <IonLabel>
                    <p style={{ paddingLeft: "0.5em" }}>{getName(item)}</p>
                  </IonLabel>
                </IonItem>
              );
            })}
          </IonList>
        </IonContent>
      ) : null}
      <IonLoading isOpen={isLoading} />
    </IonModal>
  );
}

FilePicker.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onFilePick: PropTypes.func.isRequired,
};
