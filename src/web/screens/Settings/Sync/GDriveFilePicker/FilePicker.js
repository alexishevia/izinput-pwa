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
import useAsyncState from "../../../../hooks/useAsyncState";

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

export default function FilePicker({ onCancel, onFilePick, onError }) {
  const [path, setPath] = useState("");
  const [pathIDs, setPathIDs] = useState("root");
  const [isLoading, setIsLoading] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);

  const [contents, reloadContents] = useAsyncState(
    [],
    async function* loadContents() {
      try {
        setIsLoading(true);
        const result = await loadDir({ id: getCurrentDir(pathIDs) });
        setIsLoading(false);
        yield result.contents;
      } catch (err) {
        onError(err);
        setIsLoading(false);
      }
    }
  );

  useEffect(() => {
    reloadContents();
  }, [isFileSelected, pathIDs]);

  function onGoBack(evt) {
    evt.preventDefault();
    if (path === "") {
      onCancel();
      return;
    }
    setIsFileSelected(false);
    setPath(getParentDir(path));
    setPathIDs(getParentDir(pathIDs));
  }

  function openNode(evt, node) {
    evt.preventDefault();
    if (isDir(node)) {
      setPath(`${path}/${node.name}`);
      setPathIDs(`${pathIDs}/${node.id}`);
      setIsFileSelected(false);
      return;
    }
    if (isFile(node)) {
      setIsFileSelected(true);
      onFilePick(node);
      return;
    }
    onError(new Error(`Filepicker: Unkown node type: ${node.type}`));
  }

  return (
    <IonModal isOpen onDidDismiss={() => onCancel()}>
      <FilePickerHeader path={path} onGoBack={onGoBack} />
      {contents && !contents.length ? (
        <IonItem>
          <p>The directory is empty.</p>
        </IonItem>
      ) : null}
      {contents && contents.length ? (
        <IonContent>
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
  onError: PropTypes.func.isRequired,
};
