import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import app from "../../firebase";
import { firebase } from "@firebase/app";
import DisplayOnlineUsers from "./DisplayOnlineUsers";
import DisplayChat from "./DisplayChat";
import { v4 as uuidv4 } from "uuid";
import LoadingFullScreen from "../LoadingFullScreen";

export default function Chat() {
  const { currentUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [otherUserEmail, setOtherUserEmail] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [otherUserDetails, setOtherUserDetails] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchMember, setSearchMember] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [unsub1, setUnsub1] = useState(undefined);
  const [unsub2, setUnsub2] = useState(undefined);
  const [unsub3, setUnsub3] = useState(undefined);
  const [unsub4, setUnsub4] = useState(undefined);
  const [unsub5, setUnsub5] = useState(undefined);
  var isMounted = false;

  //database ref
  const db = app.firestore().collection("conversations");
  const ref = app.firestore().collection("Users");

  useEffect(() => {
    isMounted = true;
    setUnsub1(() => getOnlineUsers());
    setUnsub2(() => getMembers());
    if (showChat == true) {
      setUnsub3(() => getChatMessages());
    }
    return () => {
      if (unsub1) {
        unsub1();
      }
      if (unsub2) {
        unsub2();
      }
      if (unsub3) {
        unsub3();
      }
      if (unsub4) {
        unsub4();
      }
      if (unsub5) {
        unsub5();
      }
      isMounted = false;
    };
  }, []);

  // query users collection for documents where online == true, these are currently "online" users
  const getOnlineUsers = () => {
    return ref.where("online", "==", true).onSnapshot((querySnapshot) => {
      if (isMounted) {
        setOnlineUsers(querySnapshot.docs.map((doc) => doc.data()));
        setIsLoading(false);
      }
    });
  };

  //get all signed up users
  const getMembers = () => {
    return ref.where("email", "!=", null).onSnapshot((querySnapshot) => {
      if (isMounted) setMembers(querySnapshot.docs.map((doc) => doc.data()));
    });
  };

  //search members
  const handleSearch = (event) => {
    setSearchMember(event.target.value);
  };

  // gets the other users document from the users collection
  // and stores that object in an array called otherUsersDetails
  const getOtherUserDetails = (email) => {
    ref
      .doc(email)
      .get()
      .then((doc) => {
        let tempArr = [];
        tempArr.push(doc.data());
        setOtherUserDetails(tempArr);
        setShowChat(true);
      })
      .catch((error) => {
        throw error;
      });
  };

  // show chat and also get chat messages from firestore, second param allows for
  //update of message.read field from false to true for the current users received messages
  const handleStartChatClick = (otherEmail, currentEmail) => {
    setOtherUserEmail(otherEmail);
    setUnsub3(() => getChatMessages(otherEmail));
    setUnsub4(() => setMessageToRead(currentEmail));
    getOtherUserDetails(otherEmail);
  };

  // close chat
  const handleCloseChatClick = () => {
    setOtherUserDetails([]);
    if (unsub3) {
      unsub3();
    }
    if (unsub4) {
      unsub4();
    }
    setShowChat(false);
  };

  const handleInputBoxChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = (event) => {
    const commentID = uuidv4();
    event.preventDefault();
      db.doc(otherUserEmail).collection("messages").add({
        message: message,
        from: currentUser.email,
        to: otherUserEmail,
        read: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        commentID: commentID,
      });
      db.doc(currentUser.email).collection("messages").add({
        message: message,
        from: currentUser.email,
        to: otherUserEmail,
        read: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        commentID: commentID,
      });
    setMessage("");
  };

  // get the chat messages (docs) from current users sub-collection
  const getChatMessages = (email) => {
    return db
      .doc(email)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) => {
        setChatMessages(snapshot.docs.map((doc) => doc.data()));
      });
  };

  //update read status to true when start chat button is clicked
  const setMessageToRead = (email) => {
    return db
      .doc(`${email}`)
      .collection("messages")
      .where("to", "==", email)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({ read: true });
        });
      });
  };

  //handle delete
  const handleDeleteMessageClick = (id) => {
    db.doc(currentUser.email)
      .collection("messages")
      .where("commentID", "==", id)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.delete();
        });
      });
    db.doc(otherUserEmail)
      .collection("messages")
      .where("commentID", "==", id)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.delete();
        });
      });
  };

  if (isLoading) {
    return <LoadingFullScreen />;
  }

  return (
    <div className="container d-flex justify-content-center chat pb-3" style={{ minHeight: "100%" }}>
      <div className="w-100 chatCont" style={{ maxWidth: "450px" }}>
        {showChat == false ? (
          <DisplayOnlineUsers
            members={members}
            chatMessages={chatMessages}
            searchMember={searchMember}
            currentUser={currentUser}
            onlineUsers={onlineUsers}
            handleStartChatClick={handleStartChatClick}
            handleSearch={handleSearch}
          />
        ) : null}
        {showChat == true ? (
          <DisplayChat
            otherUserDetails={otherUserDetails}
            currentUser={currentUser}
            chatMessages={chatMessages}
            handleCloseChatClick={handleCloseChatClick}
            handleDeleteMessageClick={handleDeleteMessageClick}
            handleSendMessage={handleSendMessage}
            otherUserEmail={otherUserEmail}
            message={message}
            handleInputBoxChange={handleInputBoxChange}
            handleDeleteMessageClick={handleDeleteMessageClick}
          />
        ) : null}
      </div>
    </div>
  );
}
