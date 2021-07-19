import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import DisplayOnlineUsers from "../Chat/DisplayOnlineUsers";
import { v4 as uuidv4 } from "uuid";
import { firebase } from "@firebase/app";
import app from "../../firebase";

export default function ShareDMModal(props) {
  const { currentUser } = useAuth();
  var isMounted = false;
  const conversationsColl = app.firestore().collection("conversations");
  const usersColl = app.firestore().collection("Users");
  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState("");
  const [message, setMessage] = useState();

  useEffect(() => {
    isMounted = true;
    const theMessage = "linkTo:moreInfo,withRecipeID:" + props.recipeID;
    setMessage(theMessage);
    const unsub1 = getMembers();
    return () => {
      isMounted = false;
      unsub1();
    };
  }, []);

  const getMembers = () => {
    return usersColl.where("email", "!=", null).onSnapshot((querySnapshot) => {
      if (isMounted) setMembers(querySnapshot.docs.map((doc) => doc.data()));
    });
  };

  const handleSearch = (event) => {
    if (isMounted) setSearchMember(event.target.value);
  };

  const handleSendDMClick = (otherUserEmail) => {
    const commentID = uuidv4();
    conversationsColl.doc(otherUserEmail).collection("messages").add({
      message: message,
      from: currentUser.email,
      to: otherUserEmail,
      read: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      commentID: commentID,
    });
    conversationsColl.doc(currentUser.email).collection("messages").add({
      message: message,
      from: currentUser.email,
      to: otherUserEmail,
      read: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      commentID: commentID,
    });

    alert("Recipe shared to " + otherUserEmail);
  };

  return (
    <div>
      <Modal show={props.showDMModal} onHide={props.handleDMShowShare} dialogClassName="modal-90w">
        <Modal.Header closeButton>
          <Modal.Title>Select a User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="user-list">
            <DisplayOnlineUsers
              members={members}
              searchMember={searchMember}
              currentUser={currentUser}
              handleSendDMClick={handleSendDMClick}
              handleSearch={handleSearch}
              shareDMModalOrigin={true}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary btn-md" onClick={props.handleDMShowShare}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
