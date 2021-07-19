import React, { useEffect, useRef } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { RiDeleteBin7Line } from "react-icons/ri";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const AlwaysScrollToBottom = () => {
  const elementRef = useRef();
  useEffect(() => elementRef.current.scrollIntoView());
  return <div ref={elementRef} />;
};

export default function DisplayChat(props) {
  const { setRecipeID } = useAuth();

  function MessageHasLink(message) {
    if (message.substring(0, 29) !== "linkTo:moreInfo,withRecipeID:") {
      return false;
    } else if (message.length > 30) {
      return message.substring(29);
    }
  }

  return (
    <div className="container d-flex justify-content-center" style={{ minHeight: "100%" }}>
      <div className="w-100" style={{ maxWidth: "450px" }}>
        <div className="card">
          {props.otherUserDetails.map((user) => (
            <div className="chat-nav card-header" key={user.uuid}>
              <button className="back" onClick={props.handleCloseChatClick}>
                <IoIosArrowBack />
              </button>
              <img
                className="rounded-circle ml-3"
                src={user.avatar != null ? user.avatar : "defaultuser.png"}
                height="60"
                width="60"
              />
              <div className="d-inline ml-4">
                <b>{user.firstName + " " + user.lastName}</b>
              </div>
            </div>
          ))}
          <div className="">
            <div className="chat-b p-2">
              {props.chatMessages.map((message) => (
                <div key={message.timestamp} className="mb-2">
                  {message.to === props.currentUser.email && message.from === props.otherUserEmail && (
                    <div className="d-flex flex-column">
                      <div className="other-user-msg">
                        {MessageHasLink(message.message) === false ? (
                          message.message
                        ) : (
                          <div>
                            I thought you might like this recipe:
                            <br />
                            <Link to="/more-info">
                              <button className="" onClick={() => setRecipeID(message.message.substring(29))}>
                                View Recipe
                              </button>
                            </Link>
                          </div>
                        )}
                      </div>
                      <div className="d-flex">
                        <div className="message-timestamp mt-2 mr-1">
                          {new Date(message.timestamp?.toDate()).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {message.from === props.currentUser.email && message.to === props.otherUserEmail && (
                    <div className="d-flex flex-column">
                      <div className="current-user-msg">
                        {MessageHasLink(message.message) === false ? (
                          message.message
                        ) : (
                          <div>
                            I thought you might like this recipe:
                            <br />
                            <Link to="/more-info">
                              <button className="" onClick={() => setRecipeID(message.message.substring(29))}>
                                View Recipe
                              </button>
                            </Link>
                          </div>
                        )}
                      </div>
                      <div className="d-flex justify-content-end ">
                        <div className="message-timestamp mt-2 mr-1">
                          {new Date(message.timestamp?.toDate()).toLocaleString()}
                        </div>
                        <div style={{ cursor: "pointer" }}>
                          <RiDeleteBin7Line
                            onClick={() => props.handleDeleteMessageClick(message.commentID)}
                            size={13}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <AlwaysScrollToBottom />
            </div>
          </div>
          <form className="input-group" onSubmit={props.handleSendMessage}>
            <input
              type="text"
              className="form-control shadow-none"
              placeholder="Type a message"
              value={props.message}
              onChange={props.handleInputBoxChange}
            />
            <div className="input-group-append">
              <button className="btn btn-success" type="submit">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
