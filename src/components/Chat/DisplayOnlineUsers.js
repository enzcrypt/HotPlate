import React from "react";
import { Link } from "react-router-dom";

export default function DisplayOnlineUsers(props) {
  // filter search results
  const membersFilterFunction = (searchMember) => {
    return function (members) {
      let firstName = members.firstName.toLowerCase();
      let lastName = members.lastName.toLowerCase();

      return firstName.includes(searchMember.toLowerCase()) || lastName.includes(searchMember.toLowerCase());
    };
  };

  return (
    <div>
      <div className="card">
        <div className="card-body">
          <h3 className="card-title text-center">Who's online</h3>
          <input
            type="text"
            className="form-control shadow-none"
            placeholder="Search Users"
            aria-label="Searh Users"
            value={props.searchMember}
            onChange={props.handleSearch}
            aria-describedby="basic-addon1"
          />
        </div>
      </div>
      {props.members.filter(membersFilterFunction(props.searchMember)).map((user) => (
        <div
          key={user.uuid}
          className="card"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (props.shareDMModalOrigin !== true) props.handleStartChatClick(user.email, props.currentUser.email);
          }}>
          {user.email !== props.currentUser.email && (
            <div className="card-body">
              <div key={"child" + user.uuid} className="row">
                <div className="col">
                  <img
                    className="rounded-circle"
                    src={user.avatar != null ? user.avatar : "defaultuser.png"}
                    height="80"
                    width="80"
                  />
                </div>
                <div className="col-6">
                  <div className="mb-1">{user.firstName + " " + user.lastName}</div>
                  <div className="online-user-email mb-2">{user.email}</div>
                  <div>
                    {user.online ? (
                      <small className="alert alert-success p-1" role="alert">
                        Active
                      </small>
                    ) : (
                      <small className="alert alert-danger p-1" role="alert">
                        Offline
                      </small>
                    )}
                  </div>
                </div>
                <div className="col">
                  {props.shareDMModalOrigin ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        props.handleSendDMClick(user.email);
                      }}>
                      Send to {user.firstName}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
